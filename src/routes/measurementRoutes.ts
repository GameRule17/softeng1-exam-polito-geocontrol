//   measurementRoutes.ts

import { Router, Request, Response, NextFunction } from "express";
import { authenticateUser } from "@middlewares/authMiddleware";
import { UserType } from "@models/UserType";
import {
  getSensorMeasurements,
  storeMeasurements,
  getMeasurement,
  updateMeasurement,
  deleteMeasurement
} from "@controllers/measurementController";
import { Measurement } from "@dto/Measurement";

const router = Router();
// Get all measurements of a sensor (Any authenticated user)
router.get(
  "/api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac/measurements",
  authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await getSensorMeasurements(
        req.params.networkCode,
        req.params.gatewayMac,
        req.params.sensorMac
      );

      res.status(200).json({
        sensorMacAddress: req.params.sensorMac,
        measurements: result
      });
      
    } catch (error) {
      next(error);
    }
  }
);



// Create new measurements (Admin & Operator)
router.post(
  "/api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac/measurements",
  authenticateUser([UserType.Admin, UserType.Operator]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dtoArray: Measurement[] = req.body;
      await storeMeasurements(
        req.params.networkCode,
        req.params.gatewayMac,
        req.params.sensorMac,
        dtoArray
      );
      res.status(201).send();
    } catch (error) {
      next(error);
    }
  }
);

// Get a specific measurement (Any authenticated user)
router.get(
  "/api/v1/measurements/:measurementId",
  authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await getMeasurement(parseInt(req.params.measurementId));
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

// Update a measurement (Admin & Operator)
router.patch(
  "/api/v1/measurements/:measurementId",
  authenticateUser([UserType.Admin, UserType.Operator]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto: Measurement = req.body;
      await updateMeasurement(parseInt(req.params.measurementId), dto);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

// Delete a measurement (Admin & Operator)
router.delete(
  "/api/v1/measurements/:measurementId",
  authenticateUser([UserType.Admin, UserType.Operator]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await deleteMeasurement(parseInt(req.params.measurementId));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default router;
