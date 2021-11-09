// 该模块用于解析文件类型，不同文件类型进行不同的解析
import CAMCPDF from "./CAMCPDF";
import LEARPDF from "./LEARPDF";
import LOROMPDF from "./LOROMPDF";

export default async function loadPDFData(file, shipTo, message) {
  switch (shipTo) {
    case "1000005247":
      return CAMCPDF(file);
    case "1000030157":
      return LEARPDF(file);
    case "1000028775":
      return LOROMPDF(file);
    default:
      message.warning("暂时不支持解析此客户的PDF文件");
  }
}
