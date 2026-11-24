import csv

import json
from pathlib import Path

import numpy as np
from sklearn.linear_model import LinearRegression

csv_file = Path(__file__).with_name("human.csv")

print("""CSV indexes
    0: arm_circumference_cm
    1: arm_length_cm
    2: chest_circumference_cm
    3: leg_length_cm
    4: pelvis_circumference_cm
    5: shoulder_width_cm
    6: thigh_circumference_cm
    7: under_chest_circumference_cm
    8: waist_circumference_cm
    9: height
    10: arm_px
    11: chest_front_px
    12: chest_side_px
    13: bust_front_px
    14: bust_side_px
    15: gluteus_front_px
    16: gluteus_side_px
    17: leg_px
    18: belly_front_px
    19: belly_side_px
    20: shoulders_px
    21: arm_length_px
    22: leg_length_px
""")

while True:
    try:
        input1 = int(input("CSV input index: "))

        if input1 < 0 or input1 > 22:
            print("An error occurred")
        else:
            break
    except ValueError:
        print("An error occurred")

while True:
    try:
        output = int(input("CSV output index: "))

        if output < 0 or output > 22 or input1 == output:
            print("An error occurred")
        else:
            break
    except ValueError:
        print("An error occurred")

input_data = []
output_data = []

with open(csv_file, mode="r", newline="") as file:
    csv_reader = csv.reader(file)

    next(csv_reader)

    for row in csv_reader:
        input_data.append(float(row[input1]))
        output_data.append(float(row[output]))

################
### TRAINING ###
################

X = np.array(input_data).reshape((-1, 1))
Y = np.array(output_data)

model = LinearRegression()
model.fit(X, Y)

#GETTING VALUES TO SAVE IN THE DATABASE
coefficient = model.coef_
intercept = model.intercept_

print("TRAINING COEFFICIENTS:\n" + str(coefficient))
print("TRAINING INTERCEPT:\n" + str(intercept))

#####################################
### USER INPUT PREDICTION EXAMPLE ###
#####################################

predict = np.array([[25]])

print("predict = ", predict)
print("PREDICTION = ", model.predict(predict))

###############################
### LOCAL TRAINED PARAMETERS ###
###############################

# This experiment never mutates shared database coefficients.
admitted_labels = ["ARM", "LEG", "SHOULDERS", "ARM_LENGTH", "LEG_LENGTH"]
while True:
    label = input("Regression label: ").strip().upper()
    if label in admitted_labels:
        break
    print("Choose a label matching the regression type")

parameters = {
    "label": label,
    "coefficients": coefficient.tolist(),
    "intercept": float(intercept)
}
output_path = Path(__file__).with_name("trained_parameters.json")
output_path.write_text(json.dumps(parameters, indent=2) + "\n", encoding="utf-8")
print(f"Trained parameters saved locally to {output_path}")
