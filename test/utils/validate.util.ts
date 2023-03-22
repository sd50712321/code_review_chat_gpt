import { ValidationError } from 'class-validator'

/**
 * 유효성 검사에서 해당 프로퍼티가 통과 못했는지 확인하는 유틸 메소드
 *
 * @param validateResult 유효성 검사 발생 오류 객체
 * @param properties 오류 발생 프로퍼티 명
 */
export function expectValidPropertiesContain(validateResult: ValidationError[], properties: string[]) {
  const validateProperties = validateResult.map((el) => el.property)
  for (const property of properties) {
    expect(validateProperties.find((el) => el === property)).toBeDefined()
  }
}
