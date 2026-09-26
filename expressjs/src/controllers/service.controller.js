import { getActiveServices } from "../services/service.service.js";
import { success } from "../views/json.view.js";

export async function listServices(req, res) {
  const services = await getActiveServices(req.validated.query);
  return success(res, services);
}