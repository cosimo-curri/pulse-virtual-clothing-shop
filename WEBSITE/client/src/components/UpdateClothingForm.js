import { useState } from "react";

function UpdateClothingForm(props) {
    const [form, setForm] = useState({
        price: props.clothing.price,
        gender: props.clothing.gender,
        type: props.clothing.type,
        material: props.clothing.material,
        quantity: props.clothing.quantity,
        size: props.clothing.size,
        length: props.clothing.dimensions.length,
        width: props.clothing.dimensions.width,
        neckWidth: props.clothing.dimensions.neckWidth,
        sleeveWidth: props.clothing.dimensions.sleeveWidth
    });

    const handleChange = (event) => {
        setForm({ ...form, [event.target.name]: event.target.value });
    }

    return (
        <>
            <br/>
            <hr/>
            <br/>

            <form onSubmit={ props.handleUpdateClothing }>
                <h3>UPDATE { props.clothing.type + " (" + props.clothing.material + ")"}</h3>

                <input type="hidden" name="clothingId" value={ props.clothing._id } />

                <label htmlFor="price">Price</label>
                <input type="number" name="price" id="price" step="0.01" min="0.01" placeholder="€ 49,99" value={ form.price } onChange={ handleChange } required />

                <label htmlFor="gender">Gender</label>
                <select name="gender" id="gender" value={ form.gender } onChange={ handleChange }>
                    <option value="MALE">MALE</option>
                    <option value="FEMALE">FEMALE</option>
                </select>

                <label htmlFor="type">Type</label>
                <select name="type" id="type" value={ form.type } onChange={ handleChange }>
                    <option value="T_SHIRT_1">T-SHIRT #1</option>
                </select>

                <label htmlFor="material">Material</label>
                <select name="material" id="material" value={ form.material } onChange={ handleChange }>
                    <option value="COTTON">COTTON</option>
                    <option value="RUBBER">RUBBER</option>
                    <option value="WOOL">WOOL</option>
                    <option value="LEATHER">LEATHER</option>
                    <option value="FUR">FUR</option>
                    <option value="POLYESTER">POLYESTER</option>
                    <option value="VELVET">VELVET</option>
                </select>

                <label htmlFor="quantity">Quantity</label>
                <input type="number" name="quantity" step="1" min="1" placeholder="10" value={ form.quantity } onChange={ handleChange } required />

                <label htmlFor="size">Size</label>
                <select name="size" value={ form.size } onChange={ handleChange }>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                </select>
                
                <h1>Dimensions (cm)</h1>

                <label htmlFor="Length">Length</label>
                <input type="number" name="length" id="length" step="0.01" min="0.01" placeholder="70" value={ form.length } onChange={ handleChange } required />
                <label htmlFor="Width">Width</label>
                <input type="number" name="width" id="width" step="0.01" min="0.01" placeholder="49" value={ form.width } onChange={ handleChange } required />
                <label htmlFor="Neck width">Neck width</label>
                <input type="number" name="neckWidth" id="neckWidth" step="0.01" min="0.01" placeholder="7" value={ form.neckWidth } onChange={ handleChange } required />
                <label htmlFor="Sleeve width">Sleeve width</label>
                <input type="number" name="sleeveWidth" id="sleeveWidth" step="0.01" min="0.01" placeholder="9" value={ form.sleeveWidth } onChange={ handleChange } required />

                <button>Update</button>
            </form>
        </>
    );
}

export default UpdateClothingForm;