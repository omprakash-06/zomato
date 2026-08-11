/**
 * Backend error response shape is: { success: false, error: "message here" }
 * (NOT { message: "..." }). Use this everywhere instead of guessing the
 * field name each time.
 */
export function getErrorMessage(err, fallback = "Something went wrong. Please try again.") {
  return err?.response?.data?.error || fallback;
}
