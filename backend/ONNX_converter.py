
import sys
print(sys.executable)

import torch
import numpy as np
from torch.export import TS2EPConverter 


# Load your scripted PyTorch models
mlp_model = torch.jit.load("mlp_model_scripted.pt")
rbf_model = torch.jit.load("rbf_model_scripted.pt")


print("torch models loaded")

# Print the graph to see expected input shapes
#print(mlp_model.graph)
#print(rbf_model.graph)
#result: expects single input tensor

# get number of intput features:
print(mlp_model.fc1.in_features)
print(rbf_model.rbflayer.in_features)
#result: number of input features is 63


# Determine number of input features
num_features = 63  # Replace with the number your model expects (match input_df.shape[1])

# # Dummy input for export
dummy_input = torch.randn(1, num_features, dtype=torch.float32)

# Convert ScriptModules to ExportedProgram
mlp_ep = TS2EPConverter(mlp_model, args=(dummy_input,)).convert()
rbf_ep = TS2EPConverter(rbf_model, args=(dummy_input,)).convert()

# Export both models to ONNX
torch.onnx.export(
    mlp_ep,
    dummy_input,
    "mlp_model.onnx",
    input_names=["input"],
    output_names=["output"],
    opset_version=18
)

torch.onnx.export(
    rbf_ep,
    dummy_input,
    "rbf_model.onnx",
    input_names=["input"],
    output_names=["output"],
    opset_version=18
)

print("Export complete — mlp_model.onnx and rbf_model.onnx created!")
