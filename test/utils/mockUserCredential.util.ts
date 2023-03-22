import { createUserToken, getUserCredentialByToken } from '@/auth/token'
import { UserCredential } from '@/auth/types'
import { TEST_USERNAME, TEST_USER_ID, TEST_USER_PRIVILEGES } from '@test/config/constants'

const mockUserToken = createUserToken({
  id: TEST_USER_ID,
  username: TEST_USERNAME,
  privileges: TEST_USER_PRIVILEGES,
})

export function testUserToken(payload?: Omit<UserCredential, 'updatePrivilege'>) {
  const token = payload ? createUserToken(payload) : mockUserToken

  return 'dotkn=' + token
}

export async function getMockCredential(payload?: Omit<UserCredential, 'updatePrivilege'>) {
  return getUserCredentialByToken(payload ? createUserToken(payload) : mockUserToken)
}
