import { create } from "venom-bot";
import venomOptions from "./venom-options";

export const whatsappProvider = {
  provide: 'WHATSAPP',
  useFactory: async () => create(venomOptions),
}
