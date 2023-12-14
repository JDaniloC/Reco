import mongoose from "mongoose";
import { AuthorType } from "./Acordos";

export interface Message {
  autor: AuthorType;
  acordoID: string;
  texto: string;
  data?: Date;
}

const MessageSchema = new mongoose.Schema({
  acordoID: String,
  autor: String,
  texto: String,
  data: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Mensagens ||
  mongoose.model("Mensagens", MessageSchema);

