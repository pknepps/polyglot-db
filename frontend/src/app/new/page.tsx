import {ReactElement, useState} from "react";

/**
 * The pages for allowing the entering of new data. Allows for both random and manual data entry.
 */
export default function NewLayout(): ReactElement {
    const [pageSelected, setPageSelected] = useState<ReactElement>(<div></div>);

    return <div>
        <div>
            <span className="header-buttons">
                <button
                    className="btn outline-1 w-40 rounded-2xl inline-block hover:bg-stone-200 active:bg-stone-600 active:text-white"
                    type="submit"
                >
                    Create Product
                </button>
                <button
                    className="btn outline-1 w-40 rounded-2xl inline-block hover:bg-stone-200 active:bg-stone-600 active:text-white"
                    type="submit"
                >
                    Create User
                </button>
                <button
                    className="btn outline-1 w-40 rounded-2xl inline-block hover:bg-stone-200 active:bg-stone-600 active:text-white"
                    type="submit"
                >
                    Create Transaction
                </button>
                <button
                    className="btn outline-1 w-40 rounded-2xl inline-block hover:bg-stone-200 active:bg-stone-600 active:text-white"
                    type="submit"
                >
                    Generate Random Data
                </button>
            </span>
        </div>
        <div>
            {pageSelected}
        </div>
    </div>
}