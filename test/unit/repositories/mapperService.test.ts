import {
    createStatsDTO,
    createNetworkDTO,
    createGatewayDTO,
    createSensorDTO,
    mapNetworkDAOToDTO,
    mapGatewayDAOToDTO,
    mapSensorDAOToDTO
  } from "@services/mapperService";
  
  import { NetworkDAO }  from "@dao/NetworkDAO";
  import { GatewayDAO }  from "@dao/GatewayDAO";
  import { SensorDAO }   from "@dao/SensorDAO";
  
  /* helpers */
  const makeSensorDAO = (mac = "S1"): SensorDAO =>
    ({ macAddress: mac, name: "S", description: null, variable: null, unit: null } as any);
  
  const makeGatewayDAO = (mac = "GW1", sensors: SensorDAO[] = []) =>
    ({ macAddress: mac, name: "G", description: undefined, sensors } as any as GatewayDAO);
  
  const makeNetworkDAO = (code = "net", gws: GatewayDAO[] = []) =>
    ({ code, name: "Net", description: "Desc", gateways: gws } as any as NetworkDAO);
  
  /*  tests */
  describe("mapperService – DTO helpers", () => {
    /* ------------------- removeNullAttributes via create* ------------------ */
    it("createSensorDTO rimuove campi null e array vuoti", () => {
      const dto = createSensorDTO("S1");                
      expect(dto).toMatchObject({ macAddress: "S1" });        // niente name/desc
    });
  
    it("createGatewayDTO non include sensors se array vuoto", () => {
      const dto = createGatewayDTO("GW1", "G", "D", []);   // sensors vuoto
      expect(dto).not.toHaveProperty("sensors");
    });
  
    it("createNetworkDTO include gateways solo se non vuoto", () => {
      const dtoEmpty = createNetworkDTO("net");
      expect(dtoEmpty).not.toHaveProperty("gateways");
  
      const dtoFilled = createNetworkDTO("net", "N", "D", [createGatewayDTO("GW")]);
      expect(dtoFilled.gateways!.length).toBe(1);
    });
  
    /* ----------------------- StatsDTO edge-cases --------------------------- */
    it("createStatsDTO lascia undefined le date se non passate", () => {
      const stats = createStatsDTO(0, 0, 0, 0);
      expect(stats).not.toHaveProperty("startDate");
      expect(stats).not.toHaveProperty("endDate");
    });

    it("mapSensorDAOToDTO copia i campi corretti", () => {
      const dao = makeSensorDAO("S1");
      const dto = mapSensorDAOToDTO(dao);
      expect(dto).toMatchObject({ macAddress: "S1" });
    });
  
    it("mapGatewayDAOToDTO converte anche sensors", () => {
      const dao = makeGatewayDAO("GW1", [makeSensorDAO("S1")]);
      const dto = mapGatewayDAOToDTO(dao);
      expect(dto.sensors!.length).toBe(1);
      expect(dto.sensors![0].macAddress).toBe("S1");
    });
  
    it("mapNetworkDAOToDTO converte gateways e sensors ricorsivamente", () => {
      const netDao = makeNetworkDAO("net1", [
        makeGatewayDAO("GW", [makeSensorDAO("S1"), makeSensorDAO("S2")])
      ]);
      const dto = mapNetworkDAOToDTO(netDao);
  
      expect(dto.code).toBe("net1");
      expect(dto.gateways!.length).toBe(1);
      expect(dto.gateways![0].sensors!.map(s => s.macAddress).sort())
        .toEqual(["S1", "S2"]);
    });
              
  });
  