import csv
import json
import sys

import numpy as np

from sklearn.linear_model import LinearRegression

from sklearn.preprocessing import PolynomialFeatures
from sklearn import linear_model

import base64
import io
import os
from matplotlib.image import imread, imsave

###############
### predict ###
###############

def predict():
    json_obj = sys.argv[2] if len(sys.argv) > 2 and sys.argv[1] in ("predict", "trainingByFeedback") and len(sys.argv) > (3 if sys.argv[1] == "trainingByFeedback" else 2) else sys.stdin.read()
    data = json.loads(json_obj)

    bodyMeasurements = data["bodyMeasurements"]
    regressionParameters = data["regressionParameters"]

    ################################################
    ### LINEAR REGRESSION UNIVARIATE PREDICTIONS ###
    ################################################

    armPx = bodyMeasurements["armPx"]
    legPx = bodyMeasurements["legPx"]
    shouldersPx = bodyMeasurements["shouldersPx"]
    armLengthPx = bodyMeasurements["armLengthPx"]
    legLengthPx = bodyMeasurements["legLengthPx"]

    for index, regressionParameter in enumerate(regressionParameters):
        if regressionParameter["label"] == "ARM":
            armIndex = index
        elif regressionParameter["label"] == "LEG":
            legIndex = index
        elif regressionParameter["label"] == "SHOULDERS":
            shouldersIndex = index
        elif regressionParameter["label"] == "ARM_LENGTH":
            armLengthIndex = index
        elif regressionParameter["label"] == "LEG_LENGTH":
            legLengthIndex = index

    ###########
    ### ARM ###
    ###########

    armModel = LinearRegression()
    armRegressionParameters = regressionParameters[armIndex]

    armModel.coef_ = np.array(armRegressionParameters["coefficients"])
    armModel.intercept_ = armRegressionParameters["intercept"]

    predict = np.array([[armPx]])
    armCircumferenceCm = (armModel.predict(predict))[0]

    ###########
    ### LEG ###
    ###########

    legModel = LinearRegression()
    legRegressionParameters = regressionParameters[legIndex]

    legModel.coef_ = np.array(legRegressionParameters["coefficients"])
    legModel.intercept_ = legRegressionParameters["intercept"]

    predict = np.array([[legPx]])
    thighCircumferenceCm = (legModel.predict(predict))[0]

    #################
    ### SHOULDERS ###
    #################

    shouldersModel = LinearRegression()
    shouldersRegressionParameters = regressionParameters[shouldersIndex]

    shouldersModel.coef_ = np.array(shouldersRegressionParameters["coefficients"])
    shouldersModel.intercept_ = shouldersRegressionParameters["intercept"]

    predict = np.array([[shouldersPx]])
    shouldersWidthCm = (shouldersModel.predict(predict))[0]

    ##################
    ### ARM LENGTH ###
    ##################

    armLengthModel = LinearRegression()
    armLengthRegressionParameters = regressionParameters[armLengthIndex]

    armLengthModel.coef_ = np.array(armLengthRegressionParameters["coefficients"])
    armLengthModel.intercept_ = armLengthRegressionParameters["intercept"]

    predict = np.array([[armLengthPx]])
    armLengthCm = (armLengthModel.predict(predict))[0]

    ##################
    ### LEG LENGTH ###
    ##################

    legLengthModel = LinearRegression()
    legLengthRegressionParameters = regressionParameters[legLengthIndex]

    legLengthModel.coef_ = np.array(legLengthRegressionParameters["coefficients"])
    legLengthModel.intercept_ = legLengthRegressionParameters["intercept"]

    predict = np.array([[legLengthPx]])
    legLengthCm = (legLengthModel.predict(predict))[0]

    ###################################################
    ### POLYNOMIAL REGRESSION BIVARIATE PREDICTIONS ###
    ###################################################

    chestFrontPx = bodyMeasurements["chestFrontPx"]
    chestSidePx = bodyMeasurements["chestSidePx"]

    bustFrontPx = bodyMeasurements["bustFrontPx"]
    bustSidePx = bodyMeasurements["bustSidePx"]

    gluteusFrontPx = bodyMeasurements["gluteusFrontPx"]
    gluteusSidePx = bodyMeasurements["gluteusSidePx"]

    bellyFrontPx = bodyMeasurements["bellyFrontPx"]
    bellySidePx = bodyMeasurements["bellySidePx"]

    for index, regressionParameter in enumerate(regressionParameters):
        if regressionParameter["label"] == "CHEST":
            chestIndex = index
        elif regressionParameter["label"] == "BUST":
            bustIndex = index
        elif regressionParameter["label"] == "GLUTEUS":
            gluteusIndex = index
        elif regressionParameter["label"] == "BELLY":
            bellyIndex = index
    
    poly = PolynomialFeatures(degree=2)

    #############
    ### CHEST ###
    #############

    chestClf = linear_model.LinearRegression()
    chestRegressionParameters = regressionParameters[chestIndex]

    chestClf.coef_ = np.array(chestRegressionParameters["coefficients"])
    chestClf.intercept_ = chestRegressionParameters["intercept"]

    predict = np.array([[chestFrontPx, chestSidePx]])
    predict_ = poly.fit_transform(predict)
    predict_ = np.delete(predict_, (1), axis=1)

    chestCircumferenceCm = (chestClf.predict(predict_))[0]

    ############
    ### BUST ###
    ############

    bustClf = linear_model.LinearRegression()
    bustRegressionParameters = regressionParameters[bustIndex]

    bustClf.coef_ = np.array(bustRegressionParameters["coefficients"])
    bustClf.intercept_ = bustRegressionParameters["intercept"]

    predict = np.array([[bustFrontPx, bustSidePx]])
    predict_ = poly.fit_transform(predict)
    predict_ = np.delete(predict_, (1), axis=1)

    underChestCircumferenceCm = (bustClf.predict(predict_))[0]

    ###############
    ### GLUTEUS ###
    ###############

    gluteusClf = linear_model.LinearRegression()
    gluteusRegressionParameters = regressionParameters[gluteusIndex]

    gluteusClf.coef_ = np.array(gluteusRegressionParameters["coefficients"])
    gluteusClf.intercept_ = gluteusRegressionParameters["intercept"]

    predict = np.array([[gluteusFrontPx, gluteusSidePx]])
    predict_ = poly.fit_transform(predict)
    predict_ = np.delete(predict_, (1), axis=1)

    pelvisCircumferenceCm = (gluteusClf.predict(predict_))[0]

    #############
    ### BELLY ###
    #############

    bellyClf = linear_model.LinearRegression()
    bellyRegressionParameters = regressionParameters[bellyIndex]

    bellyClf.coef_ = np.array(bellyRegressionParameters["coefficients"])
    bellyClf.intercept_ = bellyRegressionParameters["intercept"]

    predict = np.array([[bellyFrontPx, bellySidePx]])
    predict_ = poly.fit_transform(predict)
    predict_ = np.delete(predict_, (1), axis=1)

    waistCircumferenceCm = (bellyClf.predict(predict_))[0]

    #################################################################
    ### OUTPUT THE FINAL RESULT TO THE Node.js EXECUTION INSTANCE ###
    #################################################################

    json_measurements = {
        "armCircumferenceCm": armCircumferenceCm,
        "thighCircumferenceCm": thighCircumferenceCm,
        "shouldersWidthCm": shouldersWidthCm,
        "armLengthCm": armLengthCm,
        "legLengthCm": legLengthCm,
        "chestCircumferenceCm": chestCircumferenceCm,
        "underChestCircumferenceCm": underChestCircumferenceCm,
        "pelvisCircumferenceCm": pelvisCircumferenceCm,
        "waistCircumferenceCm": waistCircumferenceCm
    }

    json_object_result = json.dumps(json_measurements)

    print(json_object_result)

##########################
### trainingByFeedback ###
##########################

def trainingByFeedback():
    json_obj = sys.argv[2] if len(sys.argv) > 2 and sys.argv[1] in ("predict", "trainingByFeedback") and len(sys.argv) > (3 if sys.argv[1] == "trainingByFeedback" else 2) else sys.stdin.read()
    data = json.loads(json_obj)

    csvFields = data["csvFields"]

    csvRow = [
        csvFields["armCircumferenceCmRef"],
        csvFields["armLengthCmRef"],
        csvFields["chestCircumferenceCmRef"],
        csvFields["legLengthCmRef"],
        csvFields["pelvisCircumferenceCmRef"],
        csvFields["shouldersWidthCmRef"],
        csvFields["thighCircumferenceCmRef"],
        csvFields["underChestCircumferenceCmRef"],
        csvFields["waistCircumferenceCmRef"],
        csvFields["height"],
        csvFields["armPx"],
        csvFields["chestFrontPx"],
        csvFields["chestSidePx"],
        csvFields["bustFrontPx"],
        csvFields["bustSidePx"],
        csvFields["gluteusFrontPx"],
        csvFields["gluteusSidePx"],
        csvFields["legPx"],
        csvFields["bellyFrontPx"],
        csvFields["bellySidePx"],
        csvFields["shouldersPx"],
        csvFields["armLengthPx"],
        csvFields["legLengthPx"]
    ]

    csvFilepath = sys.argv[3] if len(sys.argv) > 3 else sys.argv[2]

    with open(csvFilepath, mode="a", newline="") as csvFile:
        csvWriter = csv.writer(csvFile)
        csvWriter.writerow(csvRow)
    
    return fit_regression_parameters(csvFilepath)


def fit_regression_parameters(csvFilepath):
    ##############################################
    ### LINEAR REGRESSION UNIVARIATE TRAININGS ###
    ##############################################

    ###########
    ### ARM ###
    ###########

    input1 = 10
    output = 0

    input_data, output_data = extract_data(csvFilepath, input1, output)
    
    X = np.array(input_data).reshape((-1, 1))
    Y = np.array(output_data)

    armModel = LinearRegression()
    armModel.fit(X, Y)

    armModelCoefficients = armModel.coef_
    armModelIntercept = armModel.intercept_

    ###########
    ### LEG ###
    ###########

    input1 = 17
    output = 6

    input_data, output_data = extract_data(csvFilepath, input1, output)
    
    X = np.array(input_data).reshape((-1, 1))
    Y = np.array(output_data)

    legModel = LinearRegression()
    legModel.fit(X, Y)

    legModelCoefficients = legModel.coef_
    legModelIntercept = legModel.intercept_

    #################
    ### SHOULDERS ###
    #################

    input1 = 20
    output = 5

    input_data, output_data = extract_data(csvFilepath, input1, output)
    
    X = np.array(input_data).reshape((-1, 1))
    Y = np.array(output_data)

    shouldersWidthModel = LinearRegression()
    shouldersWidthModel.fit(X, Y)

    shouldersWidthModelCoefficients = shouldersWidthModel.coef_
    shouldersWidthModelIntercept = shouldersWidthModel.intercept_

    ##################
    ### ARM LENGTH ###
    ##################

    input1 = 21
    output = 1

    input_data, output_data = extract_data(csvFilepath, input1, output)
    
    X = np.array(input_data).reshape((-1, 1))
    Y = np.array(output_data)

    armLengthModel = LinearRegression()
    armLengthModel.fit(X, Y)

    armLengthModelCoefficients = armLengthModel.coef_
    armLengthModelIntercept = armLengthModel.intercept_

    ##################
    ### LEG LENGTH ###
    ##################

    input1 = 22
    output = 3

    input_data, output_data = extract_data(csvFilepath, input1, output)
    
    X = np.array(input_data).reshape((-1, 1))
    Y = np.array(output_data)

    legLengthModel = LinearRegression()
    legLengthModel.fit(X, Y)

    legLengthModelCoefficients = legLengthModel.coef_
    legLengthModelIntercept = legLengthModel.intercept_

    ###################################################
    ### POLYNOMIAL REGRESSION BIVARIATE PREDICTIONS ###
    ###################################################

    poly = PolynomialFeatures(degree=2)

    #############
    ### CHEST ###
    #############

    input1 = 11
    input2 = 12
    output = 2

    input_data, output_data = extract_data_bivariate(csvFilepath, input1, input2, output)

    X = np.array(input_data)
    X_ = poly.fit_transform(X)
    X_ = np.delete(X_, (1), axis=1)

    Y = np.array(output_data)

    chestClf = linear_model.LinearRegression()
    chestClf.fit(X_, Y)

    chestClfCoefficients = chestClf.coef_
    chestClfIntercept = chestClf.intercept_

    ############
    ### BUST ###
    ############

    input1 = 13
    input2 = 14
    output = 7

    input_data, output_data = extract_data_bivariate(csvFilepath, input1, input2, output)

    X = np.array(input_data)
    X_ = poly.fit_transform(X)
    X_ = np.delete(X_, (1), axis=1)

    Y = np.array(output_data)

    bustClf = linear_model.LinearRegression()
    bustClf.fit(X_, Y)

    bustClfCoefficients = bustClf.coef_
    bustClfIntercept = bustClf.intercept_

    ###############
    ### GLUTEUS ###
    ###############

    input1 = 15
    input2 = 16
    output = 4

    input_data, output_data = extract_data_bivariate(csvFilepath, input1, input2, output)

    X = np.array(input_data)
    X_ = poly.fit_transform(X)
    X_ = np.delete(X_, (1), axis=1)

    Y = np.array(output_data)

    gluteusClf = linear_model.LinearRegression()
    gluteusClf.fit(X_, Y)

    gluteusClfCoefficients = gluteusClf.coef_
    gluteusClfIntercept = gluteusClf.intercept_

    #############
    ### BELLY ###
    #############

    input1 = 18
    input2 = 19
    output = 8

    input_data, output_data = extract_data_bivariate(csvFilepath, input1, input2, output)

    X = np.array(input_data)
    X_ = poly.fit_transform(X)
    X_ = np.delete(X_, (1), axis=1)

    Y = np.array(output_data)

    bellyClf = linear_model.LinearRegression()
    bellyClf.fit(X_, Y)

    bellyClfCoefficients = bellyClf.coef_
    bellyClfIntercept = bellyClf.intercept_

    #################################################################
    ### OUTPUT THE FINAL RESULT TO THE Node.js EXECUTION INSTANCE ###
    #################################################################

    json_new_parameters = {
        "ARM": {
            "coefficients": armModelCoefficients.tolist(),
            "intercept": armModelIntercept.tolist()
        },
        "LEG": {
            "coefficients": legModelCoefficients.tolist(),
            "intercept": legModelIntercept.tolist()
        },
        "SHOULDERS": {
            "coefficients": shouldersWidthModelCoefficients.tolist(),
            "intercept": shouldersWidthModelIntercept.tolist()
        },
        "ARM_LENGTH": {
            "coefficients": armLengthModelCoefficients.tolist(),
            "intercept": armLengthModelIntercept.tolist()
        },
        "LEG_LENGTH": {
            "coefficients": legLengthModelCoefficients.tolist(),
            "intercept": legLengthModelIntercept.tolist()
        },
        "CHEST": {
            "coefficients": chestClfCoefficients.tolist(),
            "intercept": chestClfIntercept.tolist()
        },
        "BUST": {
            "coefficients": bustClfCoefficients.tolist(),
            "intercept": bustClfIntercept.tolist()
        },
        "GLUTEUS": {
            "coefficients": gluteusClfCoefficients.tolist(),
            "intercept": gluteusClfIntercept.tolist()
        },
        "BELLY": {
            "coefficients": bellyClfCoefficients.tolist(),
            "intercept": bellyClfIntercept.tolist()
        }
    }

    json_object_result = json.dumps(json_new_parameters)

    print(json_object_result)

def compress_image(image, energy_fraction=0.9):
    """Return a grayscale low-rank approximation preserving spectral energy."""
    if image.ndim == 3:
        image = image[..., :3].mean(axis=-1)
    X = np.asarray(image, dtype=np.float64)
    if X.ndim != 2 or not np.all(np.isfinite(X)):
        raise ValueError("Invalid PNG image")
    U, singular_values, VT = np.linalg.svd(X, full_matrices=False)
    squared = singular_values ** 2
    total = float(squared.sum())
    if total == 0:
        return X
    k = min(len(singular_values), int(np.searchsorted(np.cumsum(squared), energy_fraction * total)) + 1)
    return (U[:, :k] * singular_values[:k]) @ VT[:k, :]

###########
### svd ###
###########

def svd():
    json_data = sys.stdin.read()
    data = json.loads(json_data)
    
    imageBase64Front1 = data["imageBase64Front1"]
    imageBase64Front2 = data["imageBase64Front2"]
    imageBase64Side = data["imageBase64Side"]

    uniqueFilenameFront1 = data["uniqueFilenameFront1"]
    uniqueFilenameFront2 = data["uniqueFilenameFront2"]
    uniqueFilenameSide = data["uniqueFilenameSide"]

    ##################
    ### SVD FRONT1 ###
    ##################

    i1 = base64.b64decode(imageBase64Front1)
    i1 = io.BytesIO(i1)
    i1 = imread(i1, format="png")

    Xa1 = compress_image(i1)

    ##################
    ### SVD FRONT2 ###
    ##################

    i2 = base64.b64decode(imageBase64Front2)
    i2 = io.BytesIO(i2)
    i2 = imread(i2, format="png")

    Xa2 = compress_image(i2)

    ################
    ### SVD SIDE ###
    ################

    i3 = base64.b64decode(imageBase64Side)
    i3 = io.BytesIO(i3)
    i3 = imread(i3, format="png")

    Xa3 = compress_image(i3)

    #######################################################
    ### FINAL SAVE IN THE FILE SYSTEM OF THE WEB SERVER ###
    #######################################################

    imsave(os.path.join(sys.argv[2], uniqueFilenameFront1 + ".jpg"), np.clip(Xa1, 0, 1), cmap="gray", vmin=0, vmax=1)
    imsave(os.path.join(sys.argv[2], uniqueFilenameFront2 + ".jpg"), np.clip(Xa2, 0, 1), cmap="gray", vmin=0, vmax=1)
    imsave(os.path.join(sys.argv[2], uniqueFilenameSide + ".jpg"), np.clip(Xa3, 0, 1), cmap="gray", vmin=0, vmax=1)

##################################
### EXTRACT DATA FROM CSV FILE ###
##################################

def extract_data(csvFilepath, input1, output):
    input_data = []
    output_data = []

    with open(csvFilepath, mode="r", newline="") as csvFile:
        csvReader = csv.reader(csvFile)

        next(csvReader)

        for row in csvReader:
            input_data.append(float(row[input1]))
            output_data.append(float(row[output]))

    return input_data, output_data

def extract_data_bivariate(csvFilepath, input1, input2, output):
    input_data = []
    output_data = []

    with open(csvFilepath, mode="r", newline="") as csvFile:
        csvReader = csv.reader(csvFile)

        next(csvReader)

        for row in csvReader:
            input_data.append([float(row[input1]), float(row[input2])])
            output_data.append(float(row[output]))

    return input_data, output_data

if sys.argv[1] == "predict":
    predict()
elif sys.argv[1] == "trainingByFeedback":
    trainingByFeedback()
elif sys.argv[1] == "initialTraining":
    if len(sys.argv) != 3:
        raise ValueError("initialTraining requires a CSV dataset path")
    fit_regression_parameters(sys.argv[2])
elif sys.argv[1] == "svd":
    svd()

sys.stdout.flush()