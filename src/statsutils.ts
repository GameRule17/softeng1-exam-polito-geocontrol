export const calculateStats = (values: number[]) => {

    if (!values.length) {
      throw new Error("Empty value array");
    }

    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    //i doppi asterischi sono l'operatore di elevamento a potenza
    const variance = values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / values.length;
    const std = Math.sqrt(variance);
    return {
      mean,
      variance,
      std,
      upperThreshold: mean + 2 * std, 
      lowerThreshold: mean - 2 * std,
    };
  };
  
  export const detectOutliers = (
    measurements: { value: number; createdAt: Date }[],
    lower: number,
    upper: number
  ) => {
    return measurements
      .filter(({ value }) => value < lower || value > upper)
      .map(({ createdAt, value }) => ({ createdAt, value, isOutlier: true }));
  };
  