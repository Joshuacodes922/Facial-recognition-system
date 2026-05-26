import torch.nn as nn
import torch.nn.functional as F
import torch
import torchvision.transforms as T
from PIL import Image

transform = T.Compose([
    T.Resize((100, 100)),
    T.ToTensor() #Normalizes
])

def getTransform():
    return transform

class EmbeddingCNN(nn.Module):
    def __init__(self):
        super().__init__()

        self.conv1 = nn.Conv2d(3, 64, kernel_size=10)
        self.pool = nn.MaxPool2d(2, stride=2, padding=1)

        self.conv2 = nn.Conv2d(64, 128, kernel_size=7)
        self.conv3 = nn.Conv2d(128, 128, kernel_size=4)
        self.conv4 = nn.Conv2d(128, 256, kernel_size=4)

        self.flatten = nn.Flatten()
        self.fc1 = nn.Linear(256 * 7 * 7, 256)
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        x = F.relu(self.conv1(x))
        x = self.pool(x)

        x = F.relu(self.conv2(x))
        x = self.pool(x)

        x = F.relu(self.conv3(x))
        x = self.pool(x)

        x = F.relu(self.conv4(x))

        x = self.flatten(x)
        x = self.sigmoid(self.fc1(x))

        return x

class SiameseNetwork(nn.Module):
    def __init__(self):
        super().__init__()

        self.embedding = EmbeddingCNN()

        self.classifier = nn.Linear(256, 1)

    def forward(self, input_image, validation_image):

        input_embedding = self.embedding(input_image)

        validation_embedding = self.embedding(validation_image)

        distances = torch.abs(input_embedding - validation_embedding)

        output = self.classifier(distances)

        return output


device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

print(torch.cuda.is_available())

if torch.cuda.is_available():
    print(torch.cuda.get_device_name(0))
else:
    print("CUDA not available → using CPU")

model = SiameseNetwork().to(device)

checkpoint = torch.load(
    'ckpt.pth',
    map_location=device
)

model.load_state_dict(checkpoint['model_state_dict'])

model.eval()

def load_image(path):
    img = Image.open(path).convert("RGB")
    img = transform(img)
    return img.unsqueeze(0)
    


print("Similarity between Joshua and testImage3:")

def checkSimiliarity(img2):
    img = load_image("Joshua.jpg").to(device)
    img2 = img2.to(device)
    with torch.no_grad():
        output = model(img, img2)
        prob = torch.sigmoid(output)

    return prob.item()


print("Similarity between Joshua and testImage3 end")