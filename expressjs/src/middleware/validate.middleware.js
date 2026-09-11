export function validate({ body, query, params } = {}) {
  return (req, _res, next) => {
    try {
      req.validated = {
        body: body ? body.parse(req.body ?? {}) : req.body,
        query: query ? query.parse(req.query ?? {}) : req.query,
        params: params ? params.parse(req.params ?? {}) : req.params,
      };
      next();
    } catch (err) {
      next(err);
    }
  };
}
