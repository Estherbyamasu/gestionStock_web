import { Link, Outlet, useNavigate, useNavigation } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { setBreadCrumbItemsAction, setToastAction } from "../../store/actions/appActions";
// import { categorie_routes_items } from "../../routes/categorie/CategoriesRoute";
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import moment from "moment";
import fetchApi from "../../helpers/fetchApi";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { SlideMenu } from 'primereact/slidemenu';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import Loading from "../../components/app/Loading";
import { Image } from 'primereact/image';
import categorie_routes_items from "../../routes/categorie/CategoriesRoute";

export default function RoleList() {
    const [selectedCity, setSelectedCity] = useState(null);
    const [date, setDate] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [selectAll, setSelectAll] = useState(false);
    const [loading, setLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(1);
    const [roles, setRoles] = useState([])
    const [selectedItems, setSelectedItems] = useState(null);
    const menu = useRef(null);
    const [inViewMenuItem, setInViewMenuItem] = useState(null)
    const [globalLoading, setGloabalLoading] = useState(false)

    const navigate = useNavigate()

    const [lazyState, setlazyState] = useState({
        first: 0,
        rows: 10,
        page: 1,
        sortField: null,
        sortOrder: null,
        search: "",
        // filters: {
        //     name: { value: '', matchMode: 'contains' },
        //     'country.name': { value: '', matchMode: 'contains' },
        //     company: { value: '', matchMode: 'contains' },
        //     'representative.name': { value: '', matchMode: 'contains' }
        // }
    });

    // const cities = [
    //     { name: 'New York', code: 'NY' },
    //     { name: 'Rome', code: 'RM' },
    //     { name: 'London', code: 'LDN' },
    //     { name: 'Istanbul', code: 'IST' },
    //     { name: 'Paris', code: 'PRS' }
    // ];

    const dispacth = useDispatch()
    const onPage = (event) => {
        setlazyState(event);
    };

    const onSort = (event) => {
        setlazyState(event);
    };

    const onFilter = (event) => {
        event['first'] = 0;
        setlazyState(event);
    };

    const onSelectionChange = (event) => {
        const value = event.value;
        setSelectedItems(value);
        setSelectAll(value.length === totalRecords);
    };

    const onSelectAllChange = (event) => {
        const selectAll = event.checked;

        if (selectAll) {
            setSelectAll(true);
            setSelectedItems(categories);
        } else {
            setSelectAll(false);
            setSelectedItems([]);
        }
    };

    const deleteItems = async (itemsIds) => {
        try {
            setGloabalLoading(true)
            await fetchApi(`/administration/role/${itemsIds}`, {
                method: 'DELETE',
            })

            dispacth(setToastAction({ severity: 'success', summary: 'Role supprimé', detail: "Le role a été supprimé avec succès", life: 3000 }))
            fetchRoles()
            setSelectAll(false)
            setSelectedItems(null)
        } catch (error) {
            console.log(error)
            dispacth(setToastAction({ severity: 'error', summary: 'Erreur du système', detail: 'Erreur du système, réessayez plus tard', life: 3000 }));
        } finally {
            setGloabalLoading(false)
        }
    }

    const handleDeletePress = (e, itemsids) => {
        e.preventDefault()
        e.stopPropagation()
        confirmDialog({
            header: 'Supprimer ?',
            message: <div className="d-flex flex-column align-items-center">
                {inViewMenuItem ? <>
                   
                    <div className="font-bold text-center my-2">{inViewMenuItem?.DESCRIPTION_ROLE}</div>
                    <div className="text-center">Voulez-vous vraiment supprimer ?</div>
                </> :
                    <>
                        <div className="text-muted">
                            {selectedItems ? selectedItems.length : '0'} selectionné{selectedItems?.length > 1 && 's'}
                        </div>
                        <div className="text-center">Voulez-vous vraiment supprimer les éléments selectionnés ?</div>
                    </>}
            </div>,
            acceptClassName: 'p-button-danger',
            accept: () => {
                deleteItems(itemsids)
            }
        });
    }

    const fetchRoles = useCallback(async () => {
        try {
            setLoading(true)
            const baseurl = `/administration/role?`
            
            var url = baseurl
            for (let key in lazyState) {
                const value = lazyState[key]
                if (value) {
                    if (typeof (value) == 'object') {
                        url += `${key}=${JSON.stringify(value)}&`
                    } else {
                        url += `${key}=${value}&`
                    }
                }
            }
            const res = await fetchApi(url)
            //console.log(res)
            setRoles(res.data)
            setTotalRecords(res.totalRecords)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }, [lazyState])

    // useEffect(() => {
    //     dispacth(setBreadCrumbItemsAction([
    //         categorie_routes_items.categorie
            
    //     ]))
    //     return () => {
    //         dispacth(setBreadCrumbItemsAction([]))
    //     }
    // }, [])
    useEffect(() => {
        fetchRoles()
    }, [lazyState]);
    return (
        <>
            <ConfirmDialog closable dismissableMask={true} />
            {globalLoading && <Loading />}
            <div className="px-4 py-3 main_content">
                <div className="d-flex align-items-center justify-content-between">
                    <h1 className="mb-3">Roles</h1>
                    <Button label="Nouveau role" icon="pi pi-plus" size="small" onClick={() => {
                        navigate("/role/new")
                    }} />
                </div>
                
                <div className="content">
                    <div className="shadow rounded mt-3 pr-1 bg-white">
                        <DataTable
                            lazy
                            value={roles}
                            tableStyle={{ minWidth: '50rem' }}
                            className=""
                            paginator
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate={`Affichage de {first} à {last} dans ${totalRecords} éléments`}
                            emptyMessage="Aucun categorie trouvé"
                            // paginatorLeft={paginatorLeft}
                            // paginatorRight={paginatorRight}
                            first={lazyState.first}
                            rows={lazyState.rows}
                            totalRecords={totalRecords}
                            onPage={onPage}
                            onSort={onSort}
                            sortField={lazyState.sortField}
                            sortOrder={lazyState.sortOrder}
                            onFilter={onFilter}
                            filters={lazyState.filters}
                            loading={loading}
                            selection={selectedItems}
                            onSelectionChange={onSelectionChange}
                            selectAll={selectAll}
                            onSelectAllChange={onSelectAllChange}
                            reorderableColumns
                            resizableColumns
                            columnResizeMode="expand"
                            paginatorClassName="rounded"
                            scrollable
                        // size="normal"
                        >
                          
                             {/* <Column field="nom" frozen header="#" sortable body={item => {
                                return (
                                    <span>{item.ID_CATEGORIE }</span>
                                )
                            }} /> */}
                            <Column field="DESCRIPTION_ROLE" frozen header="Role" sortable body={item => {
                                return (
                                    <span>{item.DESCRIPTION_ROLE}</span>
                                )
                            }} />
                           
                            <Column field="" header="Options" alignFrozen="right" frozen body={item => {
                                const items = [
                                   {
                                        template: () => {
                                            return (
                                                <Link to={`/role/edit/${inViewMenuItem?.ID_ROLE }`} className="p-menuitem-link">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16" style={{ marginRight: "0.5rem" }}>
                                                        <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                                        <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
                                                    </svg>
                                                    <span className="p-menuitem-text">Modifier</span>
                                                </Link>
                                            )
                                        }
                                    },
                                    {
                                        template: () => {
                                            return (
                                                <a href="#" className="p-menuitem-link text-danger" onClick={e => handleDeletePress(e, [inViewMenuItem.ID_ROLE])}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16" style={{ marginRight: "0.5rem" }}>
                                                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z" />
                                                        <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z" />
                                                    </svg>
                                                    <span className="p-menuitem-text text-danger">Supprimer</span>
                                                </a>
                                            )
                                        }
                                    }
                                ];
                                return (
                                    <>
                                        <SlideMenu ref={menu} model={items} popup viewportHeight={150} menuWidth={220} onHide={() => {
                                            setInViewMenuItem(null)
                                        }} />
                                        <Button rounded severity="secondary" text aria-label="Menu" size="small" className="mx-1" onClick={(event) => {
                                            setInViewMenuItem(item)
                                            menu.current.toggle(event)
                                        }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-three-dots" viewBox="0 0 16 16">
                                                <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                                            </svg>
                                        </Button>
                                    </>
                                )
                            }} />
                        </DataTable>
                    </div>
                </div>
            </div>
            <Outlet />
        </>
    )
}