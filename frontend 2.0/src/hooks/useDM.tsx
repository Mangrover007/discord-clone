import { useContext, useEffect, useState } from "react"
import axios from "axios";
import { Portal } from "../App";

export const useDM = (pageNumber: number, user: string | undefined) => {

    const context = useContext(Portal);

    const userDMs = context?.userDMs
    const setUserDMs = context?.setUserDMs

    const [loading, setLoading] = useState(false);
    const [hasMore,  setHasMore] = useState(true);

    async function getDMs() {
        try {
            setLoading(true);
            if (!user) throw new Error("username not defined idk what to send")
            const res = await axios.get(`http://localhost:3000/dms/${user}/${pageNumber}`, {
                withCredentials: true,
            });
            const { data, metadata } = res.data;
            if (metadata.page.rem <= 0) {
                setHasMore(false);
            }
            else {
                setHasMore(true);
            }
            if (setUserDMs)
                setUserDMs(prev => [...prev, ...data]);
            setLoading(false);
        } catch (e) {
            if (axios.isCancel(e)) return;
            console.log("some error happened", e);
            setLoading(false);
            setHasMore(true);
            return;
        }
    }

    useEffect(() => {
        if (pageNumber > 0)
            getDMs();
    }, [pageNumber])

    return {
        loading,
        userDMs,
        hasMore,
        setUserDMs,
        setHasMore,
    };

}
