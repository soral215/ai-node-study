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
      // return이 있으면 그대로 실행, 없으면 기본 반환값 추가
      let wrappedCode: string;
      if (hasReturn) {
        // return이 있으면 코드를 그대로 실행
        wrappedCode = code;
      } else {
        // return이 없으면 기본 반환값 추가
        wrappedCode = `${code}\nreturn { success: true, executed: true };`;
      }

      // 함수 본문으로 사용
      const func = new Function(
        ...Object.keys(context),
        wrappedCode
      );

      const result = func(...Object.values(context));
      
      // 결과가 undefined인 경우 처리
      // 이는 return 문이 있지만 실제로 값이 반환되지 않은 경우
      if (result === undefined) {
        return { 
          success: true, 
          message: '코드가 실행되었지만 반환값이 없습니다.',
          hint: '코드에 return 문이 있지만 undefined가 반환되었습니다. return 문에 명시적인 값을 지정해주세요.'
        };
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

