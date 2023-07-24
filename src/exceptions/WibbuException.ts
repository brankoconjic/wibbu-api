export interface WibbuExceptionProp {
  code: string;
  message: string;
  statusCode: number;
}

class WibbuException extends Error {
  public code: string;
  public message: string;
  public statusCode: number;

  constructor(error: WibbuExceptionProp) {
    super(error.message);
    this.code = error.code;
    this.message = error.message;
    this.statusCode = error.statusCode;
  }
}

export default WibbuException;
