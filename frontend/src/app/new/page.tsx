"use client";
import { ReactElement, useState } from "react";
import { useRouter } from "next/navigation";
import "./page.css"; // Import the CSS file

export default function NewLayout(): ReactElement {
    const router = useRouter();
    const [pageSelected, setPageSelected] = useState<ReactElement>(<div>Select an option above</div>);

    const handlePageChange = (page: string) => {
        switch (page) {
            case "product":
                setPageSelected(<div>Create Product Page</div>);
                router.push("/new/product");
                break;
            case "user":
                setPageSelected(<div>Create User Page</div>);
                router.push("/new/user");
                break;
            case "transaction":
                setPageSelected(<div>Create Transaction Page</div>);
                router.push("/new/transaction");
                break;
            case "random":
                setPageSelected(<div>Generate Random Data Page</div>);
                router.push("/new/random");
                break;
            default:
                setPageSelected(<div>Select an option above</div>);
        }
    };

    return (
        <div className="page-container2">
            <div className="page-header2">
                <h1 className="page-title2">Add Data</h1>
                <p className="page-subtitle2">Choose an option below to add new data to the system.</p>
            </div>
            <div className="button-grid2">
                <button className="btn2 btn2-blue" onClick={() => handlePageChange("product")}>
                    Create Product
                </button>
                <button className="btn2 btn2-blue" onClick={() => handlePageChange("user")}>
                    Create User
                </button>
                <button className="btn2 btn2-blue" onClick={() => handlePageChange("transaction")}>
                    Create Transaction
                </button>
                <button className="btn2 btn2-blue" onClick={() => handlePageChange("random")}>
                    Generate Random Data
                </button>
            </div>
            <div className="content-container2">
                {pageSelected ? (
                    <div className="centered-box2">{pageSelected}</div>
                ) : (
                    <div className="centered-box2">
                        <p className="centered-text2">Select an option above to see details.</p>
                    </div>
                )}
            </div>
        </div>
    );
}