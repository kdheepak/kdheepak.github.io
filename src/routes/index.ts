export async function get() {
    return {
        body: {
            humanDate: new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short' })
        }
    }
}
