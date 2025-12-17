/**
 * 안전한 코드 실행 유틸리티
 * 주의: 실제 프로덕션 환경에서는 더 강력한 sandbox가 필요합니다.
 */

export class CodeExecutor {
  /**
   * JavaScript 조건식 평가
   * @param condition 조건식 문자열
   * @param context 평가 컨텍스트 (변수들)
   * @returns 평가 결과 (boolean)
   */
  static evaluateCondition(condition: string, context: any = {}): boolean {
    if (!condition || !condition.trim()) {
      throw new Error('조건식이 비어있습니다.');
    }

    try {
      // 안전한 평가를 위해 Function 생성자 사용
      // 주의: 실제 프로덕션에서는 더 강력한 sandbox 필요
      const func = new Function(
        ...Object.keys(context),
        `return ${condition};`
      );

      const result = func(...Object.values(context));
      return Boolean(result);
    } catch (error: any) {
      throw new Error(`조건식 평가 실패: ${error.message}`);
    }
  }

  /**
   * JavaScript 코드 실행
   * @param code 실행할 코드
   * @param input 입력 데이터
   * @returns 실행 결과
   */
  static executeJavaScript(code: string, input: any = null): any {
    if (!code || !code.trim()) {
      throw new Error('코드가 비어있습니다.');
    }

    try {
      // 입력 데이터를 변수로 사용 가능하게 함
      const context = {
        input,
        // 유용한 헬퍼 함수들
        console: {
          log: (...args: any[]) => {
            // 로그는 실제 console로 출력
            console.log('[Function Node]', ...args);
          },
        },
        JSON,
        Math,
        Date,
        String,
        Number,
        Boolean,
        Array,
        Object,
      };

      // 코드에 return이 있는지 확인
      const hasReturn = /\breturn\b/.test(code);
      
      // 코드를 함수로 감싸서 실행
      const wrappedCode = hasReturn
        ? `
          (function() {
            ${code}
          })();
        `
        : `
          (function() {
            ${code}
            return { success: true, executed: true };
          })();
        `;

      const func = new Function(
        ...Object.keys(context),
        wrappedCode
      );

      const result = func(...Object.values(context));
      
      // 결과가 undefined인 경우 처리
      if (result === undefined) {
        return { success: true, message: '코드가 실행되었지만 반환값이 없습니다.' };
      }
      
      return result;
    } catch (error: any) {
      // 더 상세한 에러 메시지
      const errorMessage = error.message || String(error);
      const errorName = error.name || 'Error';
      throw new Error(`코드 실행 실패 (${errorName}): ${errorMessage}`);
    }
  }

  /**
   * Python 코드 실행 (클라이언트에서는 지원하지 않음)
   * 실제로는 서버에서 실행해야 합니다.
   */
  static executePython(_code: string, _input: any = null): any {
    throw new Error('Python 실행은 서버 환경에서만 지원됩니다.');
  }
}

