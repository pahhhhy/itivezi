import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

admin.initializeApp()

exports.setCustomClaims = functions.https.onCall(async (data, context) => {
  const { uid, role } = data
  console.log('index.ts')
  // Custom Claimsを設定
  await admin.auth().setCustomUserClaims(uid, { role })

  // Custom Tokenを生成
  const customToken = await admin.auth().createCustomToken(uid, { role })

  return { customToken }
})
