const asyncHandler = (fn: (req: any, res: any, next: any) => Promise<void>) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
export default asyncHandler
