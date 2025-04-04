const {Patients,Users} = require('../models');

const getIfPatientInfo = async (req,res) =>{
    const email = req.user.email

    try{
        const patientExists = await Patients.findOne({where:{email: email}})

        if(!patientExists){
            return res.status(200).json({formFilled: false})
        }

        return res.status(200).json({formFilled: true})
    }catch(error){
        console.error(error)
        res.status(500).json("error finding patient info")
    }
}

const inputPatientInfoForFirstTime = async (req, res) => {
    try {
        const { firstname, lastname, dateofbirth, phonenumber} = req.body;
        const email = req.user.email;  

        const user = await Users.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "Email not found." });
        }
        const patientid = user.userid;   

        console.log('Received data for patient profile creation:', { patientid, email, firstname, lastname, dateofbirth, phonenumber });

        if (!firstname || !lastname || !dateofbirth || !phonenumber) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        // create the patient profile 
        const patient = await Patients.create({
            patientid,
            email,
            firstname,
            lastname,
            dateofbirth,
            phonenumber
        });

        console.log('Patient profile created:', patient);
        res.status(201).json({ message: "Patient profile created successfully", patient });

    } catch (error) {
        console.error("Error creating patient profile:", error);
        res.status(500).json({ message: "Internal Server Error", error });
    }
};


const getPatientsNames = async (req, res) => {
    try {
        const patients = await Patients.findAll({
            attributes: ['patientid','firstname', 'lastname']
        });

        const patientNames = patients.map(patient => {
            return {
                patientid: patient.patientid, 
                name: `${patient.firstname} ${patient.lastname}`
            };
        });

        res.json(patientNames);  
    } catch (error) {
        console.error("Error fetching patients' names:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

const getMedicalHistory = async (req, res) => {
    try {
        const patient = await Patients.findOne({
            where:{email: req.user.email},
            attributes: ["chronic_conditions", "past_surgeries", "current_medications", "allergies", "lifestyle_factors", "vaccination_status"]
        })
            
        if (!patient) {
            return res.status(400).json({ message: "patient not found with token." });
        }

        res.status(200).json(patient);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error });
    }
};

const editMedicalHistory = async (req, res) => {
    console.log("Received PATCH request:", req.body);
    const { email } = req.user;
    const {
        chronicConditions,
        pastSurgeries,
        currentMedications,
        allergies,
        lifestyleFactors,
        vaccinationStatus
    } = req.body
    try {
        const patient = await Patients.findOne({
            where:{email: email},
        })

        if (!patient) {
            return res.status(400).json({ message: "patient not found with token." });
        }

        await patient.update({
            chronic_conditions: chronicConditions ?? "",
            past_surgeries: pastSurgeries ?? "",
            current_medications: currentMedications ?? "",
            allergies: allergies ?? "",
            lifestyle_factors: lifestyleFactors ?? "",
            vaccination_status: vaccinationStatus ?? ""
        });

        console.log("Database update successful:");
        res.json({ success: true });

    } catch (error) {
        console.error("Error updating medical history:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = {inputPatientInfoForFirstTime, getIfPatientInfo, getPatientsNames, getMedicalHistory, editMedicalHistory};