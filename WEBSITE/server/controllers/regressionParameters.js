const RegressionParameter = require("../models/regressionParameters");

exports.getRegressionParametersMiddleware = (req, res, next) => {
    RegressionParameter.find()
    .then(rps => {
        req.body.regressionParameters = {
            message: "GET_REGRESSION_PARAMETERS_OK",
            rps: JSON.stringify(rps)
        };

        next();
    })
    .catch(() => {
        req.body.regressionParameters = {
            message: "GET_REGRESSION_PARAMETERS_ERROR"
        };

        next();
    });
};

exports.updateRegressionParametersMiddleware = (req, res) => {
    if(
        req.body.ARM &&
        req.body.LEG &&
        req.body.SHOULDERS &&
        req.body.ARM_LENGTH &&
        req.body.LEG_LENGTH &&
        req.body.CHEST &&
        req.body.BUST &&
        req.body.GLUTEUS &&
        req.body.BELLY
    ) { 
        const ARM = req.body.ARM;
        const LEG = req.body.LEG;
        const SHOULDERS = req.body.SHOULDERS;
        const ARM_LENGTH = req.body.ARM_LENGTH;
        const LEG_LENGTH = req.body.LEG_LENGTH;
        const CHEST = req.body.CHEST;
        const BUST = req.body.BUST;
        const GLUTEUS = req.body.GLUTEUS;
        const BELLY = req.body.BELLY;

        Promise.all([
            RegressionParameter.findOne({ label: "ARM" }),
            RegressionParameter.findOne({ label: "LEG" }),
            RegressionParameter.findOne({ label: "SHOULDERS" }),
            RegressionParameter.findOne({ label: "ARM_LENGTH" }),
            RegressionParameter.findOne({ label: "LEG_LENGTH" }),
            RegressionParameter.findOne({ label: "CHEST" }),
            RegressionParameter.findOne({ label: "BUST" }),
            RegressionParameter.findOne({ label: "GLUTEUS" }),
            RegressionParameter.findOne({ label: "BELLY" })
        ])
        .then(([armRp, legRp, shouldersRp, armLengthRp, legLengthRp, chestRp, bustRp, gluteusRp, bellyRp]) => {
            armRp.coefficients = ARM.coefficients;
            armRp.intercept = ARM.intercept;

            legRp.coefficients = LEG.coefficients;
            legRp.intercept = LEG.intercept;

            shouldersRp.coefficients = SHOULDERS.coefficients;
            shouldersRp.intercept = SHOULDERS.intercept;

            armLengthRp.coefficients = ARM_LENGTH.coefficients;
            armLengthRp.intercept = ARM_LENGTH.intercept;

            legLengthRp.coefficients = LEG_LENGTH.coefficients;
            legLengthRp.intercept = LEG_LENGTH.intercept;

            chestRp.coefficients = CHEST.coefficients;
            chestRp.intercept = CHEST.intercept;

            bustRp.coefficients = BUST.coefficients;
            bustRp.intercept = BUST.intercept;

            gluteusRp.coefficients = GLUTEUS.coefficients;
            gluteusRp.intercept = GLUTEUS.intercept;

            bellyRp.coefficients = BELLY.coefficients;
            bellyRp.intercept = BELLY.intercept;

            return Promise.all([
                armRp.save(),
                legRp.save(),
                shouldersRp.save(),
                armLengthRp.save(),
                legLengthRp.save(),
                chestRp.save(),
                bustRp.save(),
                gluteusRp.save(),
                bellyRp.save()
            ]);
        })
        .then(() => {
            res.json({ message: "UPDATE_REGRESSION_PARAMETERS_OK" });
        })
        .catch(() => {
            res.json({ message: "UPDATE_REGRESSION_PARAMETERS_ERROR" });
        });
    } else
        res.json({ message: "UPDATE_REGRESSION_PARAMETERS_ERROR" });
};