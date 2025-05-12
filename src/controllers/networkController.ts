import { Network as NetworkDTO } from "@dto/Network";
import { NetworkRepository } from "@repositories/NetworkRepository";
import { mapNetworkDAOToDTO } from "@services/mapperService";

export async function getAllNetworks(): Promise<NetworkDTO[]> {
    const networkRepo = new NetworkRepository();
    return (await networkRepo.getAllNetworks()).map(mapNetworkDAOToDTO);
} 

export async function createNetwork(networkDto: NetworkDTO): Promise<void> {
  const userRepo = new NetworkRepository();
  await userRepo.createNetwork(networkDto.code, networkDto.name, networkDto.description);
}

export async function getNetwork(code: string): Promise<NetworkDTO> {
  const userRepo = new NetworkRepository();
  return mapNetworkDAOToDTO(await userRepo.getNetworkByCode(code));
}