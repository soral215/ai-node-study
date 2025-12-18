import type { Node, Edge } from 'reactflow';
import { useWorkflowStore } from '../stores/workflowStore';
import { useExecutionStore } from '../stores/executionStore';
import type { LLMNodeData, ConditionNodeData, FunctionNodeData, ImageNodeData } from '../types';
import { llmService } from '../services/llmService';
import { imageService } from '../services/imageService';
import { CodeExecutor } from '../utils/codeExecutor';
import { resolveVariables } from '../utils/variableResolver';

class WorkflowEngine {
  private isRunning = false;
  private currentNodeId: string | null = null;
  private nodeOutputs: Map<string, any> = new Map();

  async execute(nodes: Node[], edges: Edge[]) {
    this.isRunning = true;
    this.nodeOutputs.clear();
    const store = useWorkflowStore.getState();
    const executionStore = useExecutionStore.getState();

    // 모든 노드 상태 초기화
    executionStore.clearAllStates();

    // 시작 노드 찾기
    const startNode = nodes.find((node) => node.type === 'start');
    if (!startNode) {
      store.addLog({
        level: 'error',
        nodeId: 'system',
        message: '시작 노드를 찾을 수 없습니다.',
      });
      this.isRunning = false;
      return;
    }

    store.addLog({
      level: 'info',
      nodeId: startNode.id,
      message: '워크플로우 실행 시작',
    });

    await this.executeNode(startNode.id, nodes, edges, null);
    this.isRunning = false;
  }

  private async executeNode(nodeId: string, nodes: Node[], edges: Edge[], previousOutput: any) {
    if (!this.isRunning) return;

    const store = useWorkflowStore.getState();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    this.currentNodeId = nodeId;

    const executionStore = useExecutionStore.getState();
    executionStore.setNodeStatus(nodeId, 'running');

    try {
      store.addLog({
        level: 'info',
        nodeId,
        message: `노드 실행: ${node.data.label}`,
      });

      let output: any = null;
      const startTime = Date.now();

      // 노드 타입에 따른 실행
      switch (node.type) {
        case 'start':
          output = await this.executeStartNode(node);
          break;
        case 'llm':
          output = await this.executeLLMNode(node, previousOutput);
          break;
        case 'api':
          output = await this.executeAPINode(node);
          break;
        case 'function':
          output = await this.executeFunctionNode(node, previousOutput);
          break;
        case 'condition':
          output = await this.executeConditionNode(node, previousOutput);
          break;
        case 'image':
          output = await this.executeImageNode(node, previousOutput);
          break;
        case 'end':
          output = await this.executeEndNode(node);
          break;
      }

      // 노드 출력 저장
      this.nodeOutputs.set(nodeId, output);

      // 실행 상태 업데이트
      const executionTime = Date.now() - startTime;
      executionStore.setNodeResult(nodeId, output, executionTime);

      // 다음 노드 찾기
      let nextEdges = edges.filter((edge) => edge.source === nodeId);
      
      // 조건 노드의 경우 분기 처리
      if (node.type === 'condition' && typeof output === 'object' && output.condition !== undefined) {
        const conditionResult = output.condition;
        // 조건 결과에 따라 해당하는 엣지만 선택
        nextEdges = nextEdges.filter((edge) => {
          if (conditionResult) {
            return edge.sourceHandle === 'true' || !edge.sourceHandle;
          } else {
            return edge.sourceHandle === 'false';
          }
        });
      }

      for (const edge of nextEdges) {
        if (!this.isRunning) break;
        await this.executeNode(edge.target, nodes, edges, output);
      }
    } catch (error: any) {
      executionStore.setNodeError(nodeId, error.message);
      store.addLog({
        level: 'error',
        nodeId,
        message: `실행 오류: ${error.message}`,
        data: error,
      });
    }
  }

  private async executeStartNode(node: Node): Promise<any> {
    const store = useWorkflowStore.getState();
    store.addLog({
      level: 'success',
      nodeId: node.id,
      message: '워크플로우 시작',
    });
    return { message: '워크플로우 시작됨' };
  }

  private async executeLLMNode(node: Node, previousOutput: any): Promise<any> {
    const store = useWorkflowStore.getState();
    const data = node.data as LLMNodeData;

    if (!data.provider) {
      throw new Error('LLM Provider가 설정되지 않았습니다.');
    }

    if (!data.model) {
      throw new Error('LLM Model이 설정되지 않았습니다.');
    }

    store.addLog({
      level: 'info',
      nodeId: node.id,
      message: `LLM 호출: ${data.provider} - ${data.model}`,
    });

    try {
      // 이전 노드의 출력이 있으면 프롬프트에 포함
      let prompt = data.prompt || '';
      if (previousOutput) {
        const previousText = typeof previousOutput === 'string' 
          ? previousOutput 
          : JSON.stringify(previousOutput);
        prompt = prompt ? `${prompt}\n\n이전 출력: ${previousText}` : previousText;
      }

      // 변수 해석
      prompt = resolveVariables(prompt, { input: previousOutput });

      const response = await llmService.callLLM(data, prompt);
      
      store.addLog({
        level: 'success',
        nodeId: node.id,
        message: 'LLM 응답 완료',
        data: {
          content: response.content,
          usage: response.usage,
        },
      });

      return response.content;
    } catch (error: any) {
      throw new Error(`LLM 호출 실패: ${error.message}`);
    }
  }

  private async executeAPINode(node: Node): Promise<any> {
    const store = useWorkflowStore.getState();
    const data = node.data;

    if (!data.url) {
      throw new Error('API URL이 설정되지 않았습니다.');
    }

    store.addLog({
      level: 'info',
      nodeId: node.id,
      message: `API 호출: ${data.method} ${data.url}`,
    });

    try {
      // 변수 해석
      let url = resolveVariables(data.url);
      let headers = data.headers || {};
      let body = data.body;

      // Headers 변수 해석
      if (typeof headers === 'object') {
        headers = Object.fromEntries(
          Object.entries(headers).map(([key, value]) => [
            key,
            typeof value === 'string' ? resolveVariables(value) : value,
          ])
        );
      }

      // Body 변수 해석
      if (body) {
        const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
        const resolvedBody = resolveVariables(bodyStr);
        try {
          body = JSON.parse(resolvedBody);
        } catch {
          body = resolvedBody;
        }
      }

      const response = await fetch(url, {
        method: data.method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      const result = await response.json();

      store.addLog({
        level: 'success',
        nodeId: node.id,
        message: `API 응답: ${response.status}`,
        data: result,
      });

      return result;
    } catch (error: any) {
      throw new Error(`API 호출 실패: ${error.message}`);
    }
  }

  private async executeFunctionNode(node: Node, previousOutput: any): Promise<any> {
    const store = useWorkflowStore.getState();
    const data = node.data as FunctionNodeData;

    if (!data.code) {
      throw new Error('함수 코드가 설정되지 않았습니다.');
    }

    if (!data.language) {
      throw new Error('언어가 설정되지 않았습니다.');
    }

    store.addLog({
      level: 'info',
      nodeId: node.id,
      message: `함수 실행: ${data.language}`,
    });

    try {
      let result: any;

      if (data.language === 'javascript') {
        result = CodeExecutor.executeJavaScript(data.code, previousOutput);
      } else if (data.language === 'python') {
        result = CodeExecutor.executePython(data.code, previousOutput);
      } else {
        throw new Error(`지원하지 않는 언어: ${data.language}`);
      }

      store.addLog({
        level: 'success',
        nodeId: node.id,
        message: '함수 실행 완료',
        data: { result },
      });

      return result;
    } catch (error: any) {
      // 더 상세한 에러 정보 로깅
      store.addLog({
        level: 'error',
        nodeId: node.id,
        message: `함수 실행 오류: ${error.message || String(error)}`,
        data: {
          error: error.message || String(error),
          code: data.code?.substring(0, 200), // 코드 일부만 표시
          language: data.language,
        },
      });
      
      const errorMessage = error.message || error.toString() || '알 수 없는 오류';
      throw new Error(`함수 실행 실패: ${errorMessage}`);
    }
  }

  private async executeImageNode(node: Node, previousOutput: any): Promise<any> {
    const store = useWorkflowStore.getState();
    const data = node.data as ImageNodeData;

    if (!data.provider) {
      throw new Error('이미지 생성 제공자가 설정되지 않았습니다.');
    }

    if (!data.prompt) {
      throw new Error('프롬프트가 설정되지 않았습니다.');
    }

    store.addLog({
      level: 'info',
      nodeId: node.id,
      message: `이미지 생성: ${data.provider}`,
    });

    try {
      // 이전 노드의 출력이 있으면 프롬프트에 포함
      let prompt = data.prompt || '';
      if (previousOutput) {
        const previousText = typeof previousOutput === 'string' 
          ? previousOutput 
          : JSON.stringify(previousOutput);
        prompt = prompt ? `${prompt}\n\n참고: ${previousText}` : previousText;
      }

      // 변수 해석
      prompt = resolveVariables(prompt, { input: previousOutput });

      const response = await imageService.generateImage(data, prompt);
      
      store.addLog({
        level: 'success',
        nodeId: node.id,
        message: `${response.images.length}개의 이미지 생성 완료`,
        data: {
          images: response.images,
          revisedPrompt: response.revisedPrompt,
        },
      });

      return response;
    } catch (error: any) {
      throw new Error(`이미지 생성 실패: ${error.message}`);
    }
  }

  private async executeConditionNode(node: Node, previousOutput: any): Promise<any> {
    const store = useWorkflowStore.getState();
    const data = node.data as ConditionNodeData;

    if (!data.condition) {
      throw new Error('조건식이 설정되지 않았습니다.');
    }

    store.addLog({
      level: 'info',
      nodeId: node.id,
      message: `조건 평가: ${data.condition}`,
    });

    try {
      // 이전 출력을 컨텍스트로 사용
      const context: any = {};
      
      // 이전 출력이 객체인 경우 속성들을 개별 변수로 사용
      if (previousOutput && typeof previousOutput === 'object') {
        Object.assign(context, previousOutput);
        context.input = previousOutput; // input 변수로도 접근 가능
      } else {
        context.input = previousOutput;
      }

      // 조건식 평가
      const result = CodeExecutor.evaluateCondition(data.condition, context);

      store.addLog({
        level: 'success',
        nodeId: node.id,
        message: `조건 평가 완료: ${result ? 'True' : 'False'}`,
        data: { condition: data.condition, result },
      });

      return { condition: result };
    } catch (error: any) {
      throw new Error(`조건 평가 실패: ${error.message}`);
    }
  }

  private async executeEndNode(node: Node): Promise<any> {
    const store = useWorkflowStore.getState();
    store.addLog({
      level: 'success',
      nodeId: node.id,
      message: '워크플로우 종료',
    });
    return { message: '워크플로우 종료됨' };
  }

  stop() {
    this.isRunning = false;
    const store = useWorkflowStore.getState();
    store.addLog({
      level: 'warning',
      nodeId: this.currentNodeId || 'system',
      message: '워크플로우 실행 중지',
    });
  }
}

export const workflowEngine = new WorkflowEngine();

