import { useState } from 'react';
import { useWorkflowStore } from '../../stores/workflowStore';
import { workflowTemplates, loadTemplate } from '../../utils/workflowTemplates';
import { Sparkles, ChevronDown } from 'lucide-react';
import './TemplateSelector.css';

export const TemplateSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { setNodes, setEdges, setWorkflowName, setSelectedNodeId } = useWorkflowStore();

  const handleSelectTemplate = (template: typeof workflowTemplates[0]) => {
    const { nodes, edges } = loadTemplate(template);
    setNodes(nodes);
    setEdges(edges);
    setWorkflowName(template.name);
    setSelectedNodeId(null);
    setIsOpen(false);
  };

  return (
    <div className="template-selector">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="template-selector-btn"
        title="예시 워크플로우 불러오기"
      >
        <Sparkles size={16} />
        예시
        <ChevronDown size={14} className={isOpen ? 'open' : ''} />
      </button>

      {isOpen && (
        <>
          <div className="template-overlay" onClick={() => setIsOpen(false)} />
          <div className="template-dropdown">
            <div className="template-dropdown-header">
              <h3>예시 워크플로우</h3>
            </div>
            <div className="template-list">
              {workflowTemplates.map((template, index) => (
                <div
                  key={index}
                  className="template-item"
                  onClick={() => handleSelectTemplate(template)}
                >
                  <div className="template-item-header">
                    <span className="template-name">{template.name}</span>
                  </div>
                  <div className="template-description">{template.description}</div>
                  <div className="template-stats">
                    <span>{template.nodes.length}개 노드</span>
                    <span>•</span>
                    <span>{template.edges.length}개 연결</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

