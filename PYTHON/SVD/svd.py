from matplotlib.image import imread, imsave
import matplotlib.pyplot as plt
import numpy as np
import os

files_SVD = "files_SVD"

if not os.path.exists(files_SVD):
    os.makedirs(files_SVD)

for i in range(21):
    subdir = os.path.join(files_SVD, str(i))

    if not os.path.exists(subdir):
        os.makedirs(subdir)

while True:
    path = input("[CHOOSE THE IMAGE] files/")
    filepath = "files/" + path

    if os.path.exists(filepath):
        break
    else:
        print("An error occurred")

plt.rcParams["figure.figsize"] = [640 / 100, 480 / 100] #INCHES

A = imread(filepath) #MxN image x3 channels (R, G, B)
X = np.mean(A, -1) #RGB to grayscale

img = plt.imshow(X)
img.set_cmap("gray")
#plt.axis("off")
plt.title("Original Image")
plt.show()

U, S, VT = np.linalg.svd(X, full_matrices=False) #ECONOMY SVD
S = np.diag(S)

j=0

for k in (5, 20, 100):
    Xa = U[:, :k] @ S[0:k, :k] @ VT[:k, :] #Xa (X approximation)
    plt.figure(j + 1)
    j += 1
    img = plt.imshow(Xa)
    img.set_cmap("gray")
    plt.axis("off")
    plt.title("k = " + str(k))
    plt.show()

#######################
### ELBOW TECHNIQUE ###
#######################

plt.figure(1)
plt.semilogy(np.diag(S))
plt.title("Singular Values")
plt.show()

##################################
### CUMULATIVE ENERGY ANALYSIS ###
##################################

plt.figure(2)
plt.plot(np.cumsum(np.diag(S)) / np.sum(np.diag(S)))
plt.title("Cumulative Energy in the Singular Values")
plt.show()

############################
### OFFICIAL COMPRESSION ###
############################

while True:
    try:
        k = int(input("k = "))
        break
    except ValueError:
        print("An error occurred")

Xa = U[:, :k] @ S[0:k, :k] @ VT[:k, :] #Xa (X approximation)
plt.figure(3)
img = plt.imshow(Xa)
img.set_cmap("gray")
plt.axis("off")
plt.title("k = " + str(k))
plt.show()

#########################
### ERROR CALCULATION ###
#########################

absolute_error = np.linalg.norm(Xa - X) #NOT -A BECAUSE IS RGB
percent_error = absolute_error / np.linalg.norm(X) * 100

print("k = " + str(k) + " ⇒ absolute_error = " + str(absolute_error) + ", " + "percent_error = " + str(percent_error) + "%")

########################################################
### MEMORY USAGE AND COMPRESSION FACTOR CALCULATIONS ###
########################################################

m1, n1, c1 = A.shape #c1 FOR THE 3 CHANNELS
m2, n2 = X.shape

memory_usage_colored = m1 * n1 * c1
memory_usage_black_white = m2 * n2
memory_usage_svd = k * (m2 + n2)

compression_factor = k * (1/m2 + 1/n2)

print("memory_usage_colored = " + str(memory_usage_colored))
print("memory_usage_black_white = " + str(memory_usage_black_white))
print("memory_usage_svd = " + str(memory_usage_svd) + " (BLACK AND WHITE IMAGE COMPRESSION)")
print("compression_factor = " + str(compression_factor))

while True:
    choose = input("Do you like the final result? (y/n) = ").lower()

    if choose == "y" or choose == "n":
        break
    else:
        print("An error occurred")

if choose == "y":
    imsave(os.path.join(files_SVD, path), Xa, cmap="gray")
    print("The compressed image has been saved")