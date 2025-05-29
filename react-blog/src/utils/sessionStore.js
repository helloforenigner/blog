function removeCache() {
    sessionStorage.removeItem('role')
    sessionStorage.removeItem('editorDraft')
    sessionStorage.removeItem('titleDraft')
}
export { removeCache } 