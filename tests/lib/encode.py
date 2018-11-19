import sys, json
import rencode

# Read JSON in line by line.
# Print hex encoded line separated rencoded block of data

try:
  while True:
    line = sys.stdin.readline()
    if line == '':
      break
    print(rencode.dumps(json.loads(line)).encode("hex"))
    sys.stdout.flush()
except KeyboardInterrupt:
  pass
