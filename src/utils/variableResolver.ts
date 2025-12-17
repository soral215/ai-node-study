import { useVariableStore } from '../stores/variableStore';

/**
 * 텍스트에서 변수 참조를 찾아서 해석
 * 예: "Hello {{global.name}}" -> "Hello John"
 */
export function resolveVariables(text: string, additionalContext?: Record<string, any>): string {
  if (!text) return text;

  const variableStore = useVariableStore.getState();
  const variablePattern = /\{\{([^}]+)\}\}/g;

  return text.replace(variablePattern, (match, path) => {
    const trimmedPath = path.trim();

    // 추가 컨텍스트에서 먼저 찾기
    if (additionalContext) {
      // input.xxx 형식인 경우 additionalContext.input.xxx에서 찾기
      if (trimmedPath.startsWith('input.')) {
        const nestedPath = trimmedPath.substring(6); // 'input.' 제거
        const contextValue = getNestedValue(additionalContext.input, nestedPath);
        if (contextValue !== undefined) {
          return typeof contextValue === 'object' ? JSON.stringify(contextValue) : String(contextValue);
        }
      } else {
        // 직접 경로로 찾기
        const contextValue = getNestedValue(additionalContext, trimmedPath);
        if (contextValue !== undefined) {
          return typeof contextValue === 'object' ? JSON.stringify(contextValue) : String(contextValue);
        }
      }
    }

    // 변수 스토어에서 찾기
    const value = variableStore.resolveVariable(trimmedPath);
    if (value !== undefined) {
      return typeof value === 'object' ? JSON.stringify(value) : String(value);
    }

    // 변수를 찾을 수 없으면 원본 반환
    return match;
  });
}

/**
 * 객체에서 중첩된 경로로 값 가져오기
 * 예: getNestedValue({user: {name: 'John'}}, 'user.name') -> 'John'
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * 변수 참조가 있는지 확인
 */
export function hasVariables(text: string): boolean {
  if (!text) return false;
  return /\{\{[^}]+\}\}/.test(text);
}

