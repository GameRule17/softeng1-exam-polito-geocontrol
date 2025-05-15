import { CONFIG } from "@config";
import { authenticateUser } from "@middlewares/authMiddleware";
import { MeasurementFromJSON } from "@models/dto/Measurement";
import AppError from "@models/errors/AppError";
import { UserType } from "@models/UserType";
import { Router } from "express";

// Import delle funzioni dal measurementController.ts
import {
  storeMeasurement,
  getSensorMeasurements,
  getSensorStats,
  getSensorOutliers,
  getNetworkMeasurements,
  getNetworkStats,
  getNetworkOutliers,
} from "@controllers/measurementController"; // Dipendenza: measurementController.ts

// Crea una nuova istanza del Router di Express.
const router = Router();

// Store a measurement for a sensor (Admin & Operator)
router.post(
  CONFIG.ROUTES.V1_SENSORS + "/:sensorMac/measurements",
  authenticateUser([UserType.Admin, UserType.Operator]),
  async (req, res, next) => {
    try {
      const dto = MeasurementFromJSON(req.body);
      await storeMeasurement(req.params.sensorMac, dto);
      res.status(201).send();
    } catch (error) {
      next(error);
    }
  }
);

// Retrieve measurements for a specific sensor
router.get(
  CONFIG.ROUTES.V1_SENSORS + "/:sensorMac/measurements",
  authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async (req, res, next) => {
    try {
      const data = await getSensorMeasurements(req.params.sensorMac);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
);

// Retrieve statistics for a specific sensor (media, varianza, soglie)
router.get(
  CONFIG.ROUTES.V1_SENSORS + "/:sensorMac/stats",
  authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async (req, res, next) => {
    try {
      const stats = await getSensorStats(req.params.sensorMac);
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  }
);

// Retrieve only outliers for a specific sensor
//(values over )
router.get(
  CONFIG.ROUTES.V1_SENSORS + "/:sensorMac/outliers",
  authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async (req, res, next) => {
    try {
      const outliers = await getSensorOutliers(req.params.sensorMac);
      res.status(200).json(outliers);
    } catch (error) {
      next(error);
    }
  }
);

// Retrieve measurements for a set of sensors of a specific network
router.get(
  CONFIG.ROUTES.V1_NETWORKS + "/:networkCode/measurements",
  authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async (req, res, next) => {
    try {
      const data = await getNetworkMeasurements(req.params.networkCode);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
);

// Retrieve statistics for a set of sensors of a specific network
router.get(
  CONFIG.ROUTES.V1_NETWORKS + "/:networkCode/stats",
  authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async (req, res, next) => {
    try {
      const stats = await getNetworkStats(req.params.networkCode);
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  }
);

// Retrieve only outliers for a set of sensors of a specific network
router.get(
  CONFIG.ROUTES.V1_NETWORKS + "/:networkCode/outliers",
  authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async (req, res, next) => {
    try {
      const outliers = await getNetworkOutliers(req.params.networkCode);
      res.status(200).json(outliers);
    } catch (error) {
      next(error);
    }
  }
);

export default router;