import { useCallback, useEffect, useRef, useState } from "react"
import { useDispatch } from "react-redux"
import { setBreadCrumbItemsAction, setToastAction } from "../../store/actions/appActions"
// import { administration_routes_items } from "../../routes/admin/administration_routes"
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { useForm } from "../../hooks/useForm";
import { useFormErrorsHandle } from "../../hooks/useFormErrorsHandle";
import moment from "moment";
import fetchApi from "../../helpers/fetchApi";
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { FileUpload } from 'primereact/fileupload';
import wait from "../../helpers/wait";
import Loading from "../../components/app/Loading";
import { useNavigate } from "react-router-dom";

const initialForm = {
    DESCRIPTION_ROLE: ''
   
}

export default function NewRole() {
    const dispacth = useDispatch()
    const [data, handleChange, setData, setValue] = useForm(initialForm)
    const [showCalendar, setShowCalendar] = useState(false);
  
    const [isSubmitting, setIsSubmitting] = useState(false)
    const navigate = useNavigate()

    const { hasError, getError, setErrors, checkFieldData, run, isValidate, setError } = useFormErrorsHandle(data, {
        DESCRIPTION_ROLE: {
            required: true,
            alpha: true,
            length: [2, 50]
        }
    })
    const handleVisibility = (e) => {
        setShowCalendar(!showCalendar);
    };

    const handleSubmit = async (e) => {
        try {
            e.preventDefault()
            if (!isValidate()) return false
            setIsSubmitting(true)
            const form = new FormData()
            form.append("DESCRIPTION_ROLE", data.DESCRIPTION_ROLE)
            console.log(form)
           
            const res = await fetchApi('/administration/role', {
                method: 'POST',
                body: form
            })
            dispacth(setToastAction({ severity: 'success', summary: 'Role enregistré', detail: "Le role a été enregistré avec succès", life: 3000 }))
            navigate('/role')
        } catch (error) {
            console.log(error)
            if (error.httpStatus == "UNPROCESSABLE_ENTITY") {
                setErrors(error.result)
            } else {
                dispacth(setToastAction({ severity: 'error', summary: 'Erreur du système', detail: 'Erreur du système, réessayez plus tard', life: 3000 }));
            }
        } finally {
            setIsSubmitting(false)
        }
    }

   

    const invalidClass = name => hasError(name) ? 'is-invalid' : ''
    return (
        <>
            {isSubmitting ? <Loading /> : null}
            <div className="px-4 py-3 main_content bg-white has_footer">
                <div className="">
                    <h1 className="mb-3">Nouveau role</h1>
                    <hr className="w-100" />
                </div>
                <form className="form w-75 mt-5" onSubmit={handleSubmit}>
                    <div className="form-group col-sm">
                        <div className="row">
                            <div className="col-md-4">
                                <label htmlFor="role" className="label mb-1">Role</label>
                            </div>
                            <div className="col-sm">
                                <InputText autoFocus type="text" placeholder="Ecrire le nom" id="DESCRIPTION_ROLE" name="DESCRIPTION_ROLE" value={data.DESCRIPTION_ROLE} onChange={handleChange} onBlur={checkFieldData} className={`w-100 is-invalid ${hasError('nom') ? 'p-invalid' : ''}`} />
                                <div className="invalid-feedback" style={{ minHeight: 21, display: 'block' }}>
                                    {hasError('DESCRIPTION_ROLE') ? getError('DESCRIPTION_ROLE') : ""}
                                </div>
                            </div>
                        </div>
                    </div>
                   
                    <div style={{  bottom: 0, right: 0 }} className="w-100 d-flex justify-content-end  pb-3 pr-5 bg-white">
                 
                        <Button label="Envoyer" type="submit" className="mt-3 ml-3" size="small" disabled={!isValidate() || isSubmitting} />
                    </div>
                </form>
            </div>
        </>
    )
}