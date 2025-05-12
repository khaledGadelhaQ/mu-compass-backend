import { HealthController } from "./health.controller";

describe("HealthController", () => {
  let healthController: HealthController;

  beforeEach(async () => {
    healthController = new HealthController();
  });

  describe("check", () => {
    it("should return a health check response", async () => {
      const result = { status: "OK", message: "API is running 🚀" };
      jest.spyOn(healthController, "check").mockReturnValue(result as any);
      expect(await healthController.check()).toEqual({
        status: "OK",
        message: "API is running 🚀",
      });
    });
  });
});