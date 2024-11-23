import React, { useContext, useEffect, useState } from "react";
import sessionContext from "../session/session";
import { host_ip } from "../constants/host_ip";
import { listFromObject } from "../functions/objects";
import { MainPage } from "../components/reusables";
import { GetPathTitle } from "../constants/pages";
import { PagePaths } from "../constants/paths";
import { Entry } from "../components/reusables";
import { limitString } from "../functions/strings";
import { IconLink } from "../components/reusables";
import { IconButton } from "../components/reusables";
import { TabButtons } from "../components/reusables";
import AcceptIcon from "res/accept.svg";
import DenyIcon from "res/deny.svg";
import InfoImage from "res/info.svg"
import {fetchWithAuthorizationGet} from "../functions/forms";


function LoanEntryInfo({ title, reader, phone, days, address }) {
    const size = 50;

    return (
        <div className="flex flex-col align-middle text-center">
            <h6 className="font-bold text-xl">{limitString(title, size)}</h6>
            <h6 className="font-bold text-sm">{limitString(reader, size)}</h6>
            <p className="text-gray-600 font-light text-sm">{limitString(days.toString().concat(' días • ').concat(phone).concat(' • ').concat(address), size)}</p>
        </div>
    );
}

function LoanEntryIcons() {
    return (
        <>
            <IconLink src={AcceptIcon} alt="accept" path={PagePaths['ReadRecord']} />
            <IconLink src={DenyIcon} alt="deny" path={PagePaths['ReadRecord']} />
            <IconLink src={InfoImage} alt="info" path={PagePaths['ReadRecord']} />
        </>
    );
}

function LoanEntry({ title, reader, phone, days, address }) {
    return (
        <Entry
            info=<LoanEntryInfo title={title} reader={reader} phone={phone} days={days} address={address} />
            icons=<LoanEntryIcons />
        />
    );
}

function LoansTable({ data }) {

    const th_style = "py-2 px-4 border-b border-gray-200 text-base font-semibold text-gray-700 text-center";
    const td_style = "text-sm px-1 py-1 text-black text-center";

    let columns = ["Título", "Prestatario", "Encargado", "Fecha", "Duración", "Cédula", "Teléfono", "Teléfono Vecino", "Dirección"];

    return (
        <table className="min-w-full bg-white border border-gray-200 ">
            <thead className="bg-gray-100">
                <tr>
                    {columns.map((column) => (<th className={th_style}>{column}</th>))}
                    <th className={th_style}>Terminar</th>
                </tr>
            </thead>
            <tbody>
                {
                    data.map((record) => (
                        <tr className="hover:bg-gray-100 transition-all">
                            {record.map((field) => <td className={td_style}>{field}</td>)}
                            <td className={td_style}>
                                <IconButton src={DenyIcon} alt="end" />
                            </td>
                        </tr>
                    ))
                }
                <tr className="hover:bg-gray-100 transition-all">
                </tr>

            </tbody>
        </table>
    );
}

function Content() {
    const [loanRequests, setLoanRequests] = useState([]);
    const [ongoingLoans, setOngoingLoans] = useState([]);
    const { session } = useContext(sessionContext)


    useEffect(()=>{
        const getAllLoansRequests = async function(){
            let response = fetchWithAuthorizationGet(`${host_ip}/loans/requested`, session.token)
            .then(res=>res.json())
            .then(res=>{
                setLoanRequests(res);
            })
            .catch(err=>console.error(err))
        }   
        const getAllLoansOngoing = async function(){
            let response = fetchWithAuthorizationGet(`${host_ip}/loans/ongoing`, session.token)
            .then(res=>res.json())
            .then(res=>{
                setOngoingLoans(listFromObject(res, ['titulo', 'nombre', 'fk_trabajador', 'fecha_inicio', 'dias', 'cedula', 'telefono', 'telefonoVecino', 'direccion']))
            })
            .catch(err=>console.error(err))
        }   
        getAllLoansRequests();
        getAllLoansOngoing();
    }, [])

    //const ongoingLoans = [
        //["El hobbit", "Marta Jiménez", "LuisAlb56", "19-11-23", "3 días", "43.235.761", "111222333", "2223331112", "Puerto la Cruz"],
        //["Harry Potter y la piedra filosofal", "Luis Dominguez", "LuisAlb56", "29-10-24", "2 días", "89.111.223", "5555555555", "8888888888", "Barcelona"]
    //];

    const tabs = {
        'requests': 'Solicitudes',
        'ongoing': 'Vigentes'
    };

    let [content, setContent] = useState(tabs['requests']);

    function getContent() {

        return (content === tabs['ongoing'])
            ? (<LoansTable data={ongoingLoans} />)
            : (loanRequests.map(loan => <LoanEntry title={loan.titulo} reader={loan.nombre} phone={loan.telefono} days={loan.dias} address={loan.direccion} />));

    }

    const setRequestsTab = () => { setContent(tabs['requests']); };
    const setOngoingTab = () => { setContent(tabs['ongoing']); };

    return (
        <div className="flex flex-col w-[75%] self-center pt-5">
            <TabButtons first_title={tabs['requests']} second_title={tabs['ongoing']} onFirst={setRequestsTab} onSecond={setOngoingTab} />
            {getContent()}
        </div>
    );
}

const Loans = () => {
    return (
        <MainPage section={GetPathTitle(PagePaths['Loans'])} content=<Content /> />
    );
}

export default Loans;
