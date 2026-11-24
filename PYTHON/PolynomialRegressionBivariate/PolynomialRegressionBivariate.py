import csv

import json
from pathlib import Path

import numpy as np
from sklearn.preprocessing import PolynomialFeatures
from sklearn import linear_model

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
        input1 = int(input("First CSV input index: "))

        if input1 < 0 or input1 > 22:
            print("An error occurred")
        else:
            break
    except ValueError:
        print("An error occurred")

while True:
    try:
        input2 = int(input("Second CSV input index: "))

        if input2 < 0 or input2 > 22 or input1 == input2:
            print("An error occurred")
        else:
            break
    except ValueError:
        print("An error occurred")

while True:
    try:
        output = int(input("CSV output index: "))

        if output < 0 or output > 22 or input1 == output or input2 == output:
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
        input_data.append([float(row[input1]), float(row[input2])])
        output_data.append(float(row[output]))

################
### TRAINING ###
################

poly = PolynomialFeatures(degree=2)

X = np.array(input_data) #BIVARIATE INPUTS FROM DATASET
X_ = poly.fit_transform(X)
X_ = np.delete(X_, (1), axis=1)

Y = np.array(output_data) #SCALAR OUTPUTS FROM DATASET

clf = linear_model.LinearRegression()
clf.fit(X_, Y)

#GETTING VALUES TO SAVE IN THE DATABASE
coefficients = clf.coef_
intercept = clf.intercept_

print("TRAINING COEFFICIENTS:\n" + str(coefficients))
print("TRAINING INTERCEPT:\n" + str(intercept))

#####################################
### USER INPUT PREDICTION EXAMPLE ###
#####################################

predict = np.array([[25, 55]]) #USER BIVARIATE INPUT
predict_ = poly.fit_transform(predict)
predict_ = np.delete(predict_, (1), axis=1)

print("predict_ = ", predict_)
print("PREDICTION = ", clf.predict(predict_))

###############################
### LOCAL TRAINED PARAMETERS ###
###############################

# This experiment never mutates shared database coefficients.
admitted_labels = ["CHEST", "BUST", "GLUTEUS", "BELLY"]
while True:
    label = input("Regression label: ").strip().upper()
    if label in admitted_labels:
        break
    print("Choose a label matching the regression type")

parameters = {
    "label": label,
    "coefficients": coefficients.tolist(),
    "intercept": float(intercept)
}
output_path = Path(__file__).with_name("trained_parameters.json")
output_path.write_text(json.dumps(parameters, indent=2) + "\n", encoding="utf-8")
print(f"Trained parameters saved locally to {output_path}")
