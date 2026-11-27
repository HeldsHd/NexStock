export const maximumProductImageSize = 3 * 1024 * 1024;
export const acceptedProductImageTypes = ["image/jpeg", "image/png", "image/webp"];

export function readProductImageAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Não foi possível ler o arquivo de imagem."));
      }
    };
    reader.onerror = () => reject(new Error("Não foi possível ler o arquivo de imagem."));
    reader.readAsDataURL(file);
  });
}
