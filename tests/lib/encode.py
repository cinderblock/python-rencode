import sys, json
import rencode

# Read hex encoded JSON in, line by line.
# Print hex encoded line separated rencoded block of data

try:
  while True:
    line = sys.stdin.readline()
    if line == '':
      break
    print(rencode.dumps(json.loads(bytes.fromhex(line).decode('utf8'))).hex())
    sys.stdout.flush()
except KeyboardInterrupt:
  pass
