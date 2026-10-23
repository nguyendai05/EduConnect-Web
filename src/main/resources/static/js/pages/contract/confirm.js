// Consent is checked by native form validation and validated again by the server.
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('signContractForm')
  if (!form) return
  form.addEventListener('submit', () => {
    if (form.checkValidity()) form.querySelector('button[type="submit"]').disabled = true
  })
})
