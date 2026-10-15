import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'

const source = readFileSync(new URL('../../src/main/resources/static/js/core/route.js', import.meta.url), 'utf8')
let checks = 0
for (const contextPath of ['', '/edu']) {
  const assigned = []
  const sandbox = {
    URL, URLSearchParams,
    document: {
      querySelector: () => ({ content: `${contextPath}/` }),
      querySelectorAll: () => { throw new Error('Router must not rewrite DOM URLs') }
    },
    location: {
      pathname: `${contextPath}/job/detail`, search: '?id=TT-8841',
      origin: 'https://preview.test', assign: value => assigned.push(value)
    },
    MutationObserver: class { constructor() { throw new Error('Router must not install a DOM observer') } }
  }
  sandbox.window = sandbox
  vm.runInNewContext(source, sandbox)
  const route = sandbox.EduRoute
  assert.equal(route.page('home'), `${contextPath}/`)
  assert.equal(route.page('jobDetail', { id: 'TT-8841', hash: 'transactions' }), `${contextPath}/job/detail?id=TT-8841#transactions`)
  assert.equal(route.path('/wallet/overview#transactions'), `${contextPath}/wallet/overview#transactions`)
  assert.equal(route.asset('assets/icons/wallet.svg'), `${contextPath}/assets/icons/wallet.svg`)
  assert.equal(route.absolute('login'), `https://preview.test${contextPath}/auth/login`)
  assert.equal(route.pagePath, '/job/detail')
  assert.equal(route.param('id', 'jobDetail'), 'TT-8841')
  assert.equal(route.param('id', 'login'), null)
  assert.equal(route.safeReturn('https://external.test'), null)
  assert.equal(route.safeReturn('contract'), 'contract')
  assert.equal(route.ROUTES.paymentQr.shell, 'payment-minimal')
  assert.equal(route.applyScope(sandbox.document), sandbox.document)
  route.go('tutorSearch')
  assert.deepEqual(assigned, [`${contextPath}/tutor/search`])
  assert.throws(() => route.page('unknown-route'))
  checks += 14
}
console.log(`MVC route checks: PASS; assertions=${checks}; root/context path; no DOM rewriting`)
