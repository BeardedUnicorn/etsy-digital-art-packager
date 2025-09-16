declare module 'piexifjs' {
  export interface ExifData {
    '0th': Record<number, unknown>;
    Exif: Record<number, unknown>;
    GPS: Record<number, unknown>;
    Interop: Record<number, unknown>;
    '1st': Record<number, unknown>;
    thumbnail?: string | null;
  }

  export interface PiexifModule {
    ImageIFD: Record<string, number>;
    ExifIFD: Record<string, number>;
    GPSIFD: Record<string, number>;
    dump(data: ExifData): string;
    insert(exif: string, jpeg: string): string;
    remove(jpeg: string): string;
    load(data: string): ExifData;
  }

  const piexif: PiexifModule;
  export default piexif;
}
