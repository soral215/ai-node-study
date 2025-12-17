import { useCallback } from 'react';
import { Position } from 'reactflow';
import { useWorkflowStore } from '../../stores/workflowStore';
import { Play, Brain, Globe, Code, GitBranch, Square } from 'lucide-react';

interface NodeTemplate {
  type: string;
  label: string;
  icon: React.ReactNode;
  defaultData: any;
}

const nodeTemplates: NodeTemplate[] = [
  {
    type: 'start',
    label: '시작',
    icon: <Play size={16} />,
    defaultData: { label: '시작' },
  },
  {
    type: 'llm',
    label: 'LLM',
    icon: <Brain size={16} />,
    defaultData: {
      label: 'LLM',
      provider: 'openai',
      model: 'gpt-4',
      prompt: '',
    },
  },
  {
    type: 'api',
    label: 'API',
    icon: <Globe size={16} />,
    defaultData: {
      label: 'API',
      method: 'GET',
      url: '',
    },
  },
  {
    type: 'function',
    label: 'Function',
    icon: <Code size={16} />,
    defaultData: {
      label: 'Function',
      language: 'javascript',
      code: '',
    },
  },
  {
    type: 'condition',
    label: '조건',
    icon: <GitBranch size={16} />,
    defaultData: {
      label: '조건',
      condition: '',
    },
  },
  {
    type: 'end',
    label: '종료',
    icon: <Square size={16} />,
    defaultData: { label: '종료' },
  },
];

export const NodePalette = () => {
  const { addNode } = useWorkflowStore();

  const onDragStart = useCallback(
    (event: React.DragEvent, nodeType: string, defaultData: any) => {
      event.dataTransfer.setData('application/reactflow', JSON.stringify({ type: nodeType, data: defaultData }));
      event.dataTransfer.effectAllowed = 'move';
    },
    []
  );

  return (
    <div className="node-palette">
      <div className="palette-header">
        <h3>노드 팔레트</h3>
      </div>
      <div className="palette-items">
        {nodeTemplates.map((template) => (
          <div
            key={template.type}
            className="palette-item"
            draggable
            onDragStart={(e) => onDragStart(e, template.type, template.defaultData)}
          >
            <div className="palette-item-icon">{template.icon}</div>
            <span>{template.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

