import socket

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.bind((socket.gethostname(), 6060))
s.listen(5)


while True:
    clientSocket, address = s.accept()
    print(f"Connection established from {address}")
    clientSocket.send(bytes("Welcome to the server", "utf-8"))
    clientSocket.close()
