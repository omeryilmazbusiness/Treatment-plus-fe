type Fields = Record<string, unknown>;

export type Logger = {
  info(msg: string, fields?: Fields): void;
  error(msg: string, fields?: Fields): void;
};

export function createLogger(name: string): Logger {
  return {
    info: (msg, fields) => write("info", name, msg, fields),
    error: (msg, fields) => write("error", name, msg, fields),
  };
}

function write(level: string, name: string, msg: string, fields?: Fields): void {
  const line = JSON.stringify({
    time: new Date().toISOString(),
    level,
    name,
    msg,
    ...fields,
  });
  if (level === "error") {
    console.error(line);
    return;
  }
  console.info(line);
}
