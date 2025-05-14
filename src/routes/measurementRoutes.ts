import { CONFIG } from "@config";
import { authenticateUser } from "@middlewares/authMiddleware";
import AppError from "@models/errors/AppError";
import { UserType } from "@models/UserType";
import { Router } from "express";

const router = Router();

// Store a measurement for a sensor (Admin & Operator)
router.post(CONFIG.ROUTES.V1_SENSORS + "/:sensorMac/measurements", authenticateUser([UserType.Admin, UserType.Operator]),  (req, res, next) => {
    throw new AppError("Method not implemented", 500);
  }
);

// Retrieve measurements for a specific sensor
router.get(CONFIG.ROUTES.V1_SENSORS + "/:sensorMac/measurements",authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  (req, res, next) => {
    throw new AppError("Method not implemented", 500);
  }
);

// Retrieve statistics for a specific sensor
router.get(
  CONFIG.ROUTES.V1_SENSORS + "/:sensorMac/stats",
  authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  (req, res, next) => {
    throw new AppError("Method not implemented", 500);
  }
);

// Retrieve only outliers for a specific sensor
router.get(CONFIG.ROUTES.V1_SENSORS + "/:sensorMac/outliers",authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  (req, res, next) => {
    throw new AppError("Method not implemented", 500);
  }
);

// Retrieve measurements for a set of sensors of a specific network
router.get(CONFIG.ROUTES.V1_NETWORKS + "/:networkCode/measurements",authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  (req, res, next) => {
    throw new AppError("Method not implemented", 500);
  }
);

// Retrieve statistics for a set of sensors of a specific network
router.get(CONFIG.ROUTES.V1_NETWORKS + "/:networkCode/stats",authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  (req, res, next) => {
    throw new AppError("Method not implemented", 500);
  }
);

// Retrieve only outliers for a set of sensors of a specific network
router.get(CONFIG.ROUTES.V1_NETWORKS + "/:networkCode/outliers",authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  (req, res, next) => {
    throw new AppError("Method not implemented", 500);
  }
);

export default router;
