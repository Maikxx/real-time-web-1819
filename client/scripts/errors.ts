import toast from 'toastr'

toast.options.timeOut = 2000

const { search: query } = window.location
if (query) {
    if (query.includes('authentication')) {
        toast.error('It looks like we failed to validate your identity!')
    }

    if (query.includes('internal')) {
        toast.error('It looks like something went wrong!')
    }

    if (query.includes('validation')) {
        toast.error('It looks like you did not pass correct data to the server!')
    }

    if (query.includes('not-found')) {
        toast.error('Something we were looking for could not be found, please try again!')
    }
}
