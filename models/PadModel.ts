import mongoose from "mongoose";
import { generatePadCode } from "../utils/utils";
const padSchema = new mongoose.Schema<{
  padCode: string;
  text: string;
  members: string[];
}>({
  padCode: { type: String, default: generatePadCode(), unique: true },
  text: { type: String, default: "" },
});

const Pad = mongoose.model("Pad", padSchema);

export default Pad;
