import { Router } from "express";
import { getBeach } from "../controllers/beach.controller";

const router = Router();

router.get("/beach", getBeach);

export default router;
