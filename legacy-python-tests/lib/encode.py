import sys, json
import rencode

# Read hex encoded JSON in, line by line.
# Print hex encoded line separated rencoded block of data

try:
  while True:
    hexString = sys.stdin.readline()
    
    if hexString == '':
      break

    jsonBytes = bytes.fromhex(hexString)

    jsonString = jsonBytes.decode('utf8')

    data = json.loads(jsonString)

    encodedDataBytes = rencode.dumps(data)

    encodedHexString = encodedDataBytes.hex()

    print(encodedHexString)

    sys.stdout.flush()
except KeyboardInterrupt:
  pass
