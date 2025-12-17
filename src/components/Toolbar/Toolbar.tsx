import { useWorkflowStore } from '../../stores/workflowStore';
import { useHistoryStore } from '../../stores/historyStore';
import { ExecutionStatus } from '../../types';
import { Play, Square, Save, FolderOpen, RotateCcw } from 'lucide-react';
import { workflowEngine } from '../../engine/workflowEngine';
import { APIKeySettings } from '../APIKeySettings/APIKeySettings';
import { TemplateSelector } from '../TemplateSelector/TemplateSelector';
import { VariablePanel } from '../VariablePanel/VariablePanel';
import { HistoryPanel } from '../HistoryPanel/HistoryPanel';

export const Toolbar = () => {
  const {
    workflowName,
    setWorkflowName,
    executionStatus,
    setExecutionStatus,
    saveWorkflow,
    loadWorkflow,
    resetWorkflow,
    nodes,
    edges,
    logs,
  } = useWorkflowStore();
  const { addHistory } = useHistoryStore();

  const handleRun = async () => {
    if (executionStatus === ExecutionStatus.RUNNING) {
      setExecutionStatus(ExecutionStatus.IDLE);
      workflowEngine.stop();
      return;
    }

    setExecutionStatus(ExecutionStatus.RUNNING);
    const startTime = Date.now();
    const initialLogsLength = logs.length;

    try {
      await workflowEngine.execute(nodes, edges);
      const executionTime = Date.now() - startTime;
      setExecutionStatus(ExecutionStatus.SUCCESS);

      // 실행 완료 후 최신 로그 가져오기
      setTimeout(() => {
        const currentLogs = useWorkflowStore.getState().logs;
        const executionLogs = currentLogs.slice(initialLogsLength);
        addHistory({
          workflowName,
          startedAt: startTime,
          completedAt: Date.now(),
          status: 'success',
          executionTime,
          logs: executionLogs,
          nodeCount: nodes.length,
          edgeCount: edges.length,
        });
      }, 100);
    } catch (error) {
      const executionTime = Date.now() - startTime;
      setExecutionStatus(ExecutionStatus.ERROR);

      // 실행 완료 후 최신 로그 가져오기
      setTimeout(() => {
        const currentLogs = useWorkflowStore.getState().logs;
        const executionLogs = currentLogs.slice(initialLogsLength);
        addHistory({
          workflowName,
          startedAt: startTime,
          completedAt: Date.now(),
          status: 'error',
          executionTime,
          logs: executionLogs,
          nodeCount: nodes.length,
          edgeCount: edges.length,
        });
      }, 100);
    }
  };

  const handleSave = () => {
    const workflow = saveWorkflow();
    const dataStr = JSON.stringify(workflow, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${workflow.name}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLoad = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const workflow = JSON.parse(event.target?.result as string);
            loadWorkflow(workflow);
          } catch (error) {
            alert('워크플로우 파일을 불러올 수 없습니다.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <input
          type="text"
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          className="workflow-name-input"
          placeholder="워크플로우 이름"
        />
      </div>
      <div className="toolbar-right">
        <APIKeySettings />
        <VariablePanel />
        <HistoryPanel />
        <TemplateSelector />
        <button
          onClick={handleRun}
          className={`toolbar-btn ${executionStatus === ExecutionStatus.RUNNING ? 'running' : ''}`}
          disabled={nodes.length === 0}
        >
          {executionStatus === ExecutionStatus.RUNNING ? (
            <>
              <Square size={16} />
              중지
            </>
          ) : (
            <>
              <Play size={16} />
              실행
            </>
          )}
        </button>
        <button onClick={handleSave} className="toolbar-btn">
          <Save size={16} />
          저장
        </button>
        <button onClick={handleLoad} className="toolbar-btn">
          <FolderOpen size={16} />
          불러오기
        </button>
        <button onClick={resetWorkflow} className="toolbar-btn">
          <RotateCcw size={16} />
          초기화
        </button>
      </div>
    </div>
  );
};

