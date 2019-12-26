import sys, json
import rencode

# Read hex encoded line separated rencoded block of data
# Print hex encoded JSON decoded version, line by line

try:
  while True:
    hexString = sys.stdin.readline()

    if hexString == '':
      break

    dataBytes = bytes.fromhex(hexString)

    decodedData = rencode.loads(dataBytes, decode_utf8=True)

    jsonString = json.dumps(decodedData)

    jsonDataBytes = jsonString.encode('utf8')

    responseHexString = jsonDataBytes.hex()

    print(responseHexString)
    
    sys.stdout.flush()
except KeyboardInterrupt:
  pass
