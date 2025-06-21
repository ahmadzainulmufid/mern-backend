import express from "express";
import dummyConroller from "../controllers/dummy.controllers";

const router = express.Router();

router.get("/dummy", dummyConroller.dummy);

export default router;
